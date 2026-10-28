// Default: verify only. --import opts into writing; --remote selects Cloudflare.
import { readFile } from 'node:fs/promises';
import { getPlatformProxy } from 'wrangler';
import { fingerprint, quoteIdentifier as qi, readSchema, schemaFingerprint } from './d1-transfer-utils.mjs';

const args = new Set(process.argv.slice(2));
for (const arg of args) if (!['--import', '--remote'].includes(arg)) throw new Error(`Unknown argument: ${arg}`);
const snapshot = JSON.parse(await readFile('.data/neon-d1-snapshot.json', 'utf8'));
if (snapshot.version !== 1) throw new Error('Unsupported snapshot version.');
const proxy = await getPlatformProxy({ environment: args.has('--remote') ? 'remote' : undefined });
const db = proxy.env.D1;
try {
  if (schemaFingerprint(await readSchema(db)) !== snapshot.schema) throw new Error('Target schema differs from the validated export.');
  for (const table of snapshot.tables) {
    if (fingerprint(table.columns, table.rows) !== table.checksum) throw new Error(`Snapshot checksum mismatch for ${table.name}.`);
  }
  if (args.has('--import')) {
    // Keep this atomic and bounded within Workers' memory and request limits.
    if (Buffer.byteLength(JSON.stringify(snapshot)) > 16 * 1024 * 1024) throw new Error('Snapshot exceeds 16 MB. Use a reviewed, chunked migration for this dataset.');
    const statements = [db.prepare('PRAGMA defer_foreign_keys = ON')];
    for (const table of snapshot.tables) {
      const { results } = await db.prepare(`SELECT COUNT(*) AS count FROM ${qi(table.name)}`).all();
      if (results[0].count) throw new Error(`Target ${table.name} is not empty. Import refused; nothing has been changed.`);
      const sql = `INSERT INTO ${qi(table.name)} (${table.columns.map(qi).join(',')}) VALUES (${table.columns.map(() => '?').join(',')})`;
      for (const row of table.rows) statements.push(db.prepare(sql).bind(...table.columns.map((column) => row[column])));
    }
    await db.batch(statements); // D1 batches execute as a single transaction.
  }
  for (const table of snapshot.tables) {
    const { results } = await db.prepare(`SELECT * FROM ${qi(table.name)}`).all();
    if (results.length !== table.count || fingerprint(table.columns, results) !== table.checksum) throw new Error(`Data mismatch in ${table.name}. Do not switch production traffic.`);
  }
  const { results: broken } = await db.prepare('PRAGMA foreign_key_check').all();
  if (broken.length) throw new Error('D1 contains broken relationships. Do not switch production traffic.');
  console.log(`${args.has('--remote') ? 'Cloudflare' : 'Local'} D1 verified: all table counts, content checksums, and relationships match the Neon snapshot.`);
} finally {
  await proxy.dispose();
}
