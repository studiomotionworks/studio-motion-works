// Read-only PostgreSQL snapshot. Never invokes Payload hooks or touches R2 files.
import { mkdir, writeFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { Client } from 'pg';
import { getPlatformProxy } from 'wrangler';
import { fingerprint, quoteIdentifier as qi, readSchema, schemaFingerprint, skipTable, toSQLiteValue } from './d1-transfer-utils.mjs';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for the Neon export.');
const proxy = await getPlatformProxy(); // Always inspect the LOCAL D1 schema.
const pg = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000, query_timeout: 60000 });
const staging = new DatabaseSync(':memory:');

try {
  await pg.connect();
  await pg.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const schema = await readSchema(proxy.env.D1);
  const sourceTables = (await pg.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename")).rows.map(({ tablename }) => tablename);
  const targetNames = new Set(schema.map(({ name }) => name));
  for (const name of sourceTables.filter((name) => !skipTable(name) && !targetNames.has(name))) {
    const { rows } = await pg.query(`SELECT COUNT(*)::int AS count FROM ${qi(name)}`);
    if (rows[0].count) throw new Error(`Populated Neon table ${name} has no D1 equivalent. Export stopped to avoid losing data.`);
  }

  staging.exec('PRAGMA foreign_keys = ON;');
  for (const { sql } of schema) staging.exec(sql);
  const { results: indexes } = await proxy.env.D1.prepare("SELECT tbl_name, sql FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL").all();
  for (const { tbl_name, sql } of indexes) if (targetNames.has(tbl_name)) staging.exec(sql);
  staging.exec('BEGIN; PRAGMA defer_foreign_keys = ON;');
  const tables = [];
  for (const { name } of schema) {
    const columns = staging.prepare(`PRAGMA table_info(${qi(name)})`).all().map(({ name }) => name).sort();
    const sourceRows = sourceTables.includes(name) ? (await pg.query(`SELECT * FROM ${qi(name)}`)).rows : [];
    for (const row of sourceRows) {
      for (const column of Object.keys(row)) {
        if (!columns.includes(column) && row[column] !== null) throw new Error(`${name}.${column} has data but no D1 column. Export stopped.`);
      }
    }
    // Only insert source columns, allowing D1 defaults for genuinely new fields.
    const sourceColumns = sourceRows.length ? columns.filter((column) => Object.hasOwn(sourceRows[0], column)) : [];
    if (sourceRows.length && !sourceColumns.length) throw new Error(`No matching columns for ${name}.`);
    if (sourceColumns.length > 100) throw new Error(`${name} exceeds D1's 100 bound parameters per statement.`);
    if (sourceRows.length) {
      const insert = staging.prepare(`INSERT INTO ${qi(name)} (${sourceColumns.map(qi).join(',')}) VALUES (${sourceColumns.map(() => '?').join(',')})`);
      for (const row of sourceRows) insert.run(...sourceColumns.map((column) => toSQLiteValue(row[column])));
    }
    const rows = staging.prepare(`SELECT * FROM ${qi(name)}`).all();
    tables.push({ name, columns, rows, count: rows.length, checksum: fingerprint(columns, rows) });
  }
  if (staging.prepare('PRAGMA foreign_key_check').all().length) throw new Error('The exported data contains broken relationships.');
  staging.exec('COMMIT;');
  await pg.query('COMMIT');
  const snapshot = { version: 1, exportedAt: new Date().toISOString(), schema: schemaFingerprint(schema), tables };
  await mkdir('.data', { recursive: true });
  // wx refuses to overwrite an earlier backup.
  await writeFile('.data/neon-d1-snapshot.json', JSON.stringify(snapshot), { flag: 'wx', mode: 0o600 });
  console.log(`Validated Neon snapshot: ${tables.length} tables, ${tables.reduce((total, table) => total + table.count, 0)} rows. Saved under ignored .data/.`);
  console.log('Password hashes, IDs, relationships, JSON, timestamps, and media paths are preserved. Sessions and edit locks are excluded.');
} finally {
  staging.close();
  await pg.end();
  await proxy.dispose();
}
