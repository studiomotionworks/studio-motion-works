import { readFile, writeFile } from 'node:fs/promises';

const [databaseId] = process.argv.slice(2);
if (!databaseId || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(databaseId) || databaseId === '00000000-0000-0000-0000-000000000000') {
  throw new Error('Usage: node scripts/configure-d1.mjs <Cloudflare D1 database UUID>');
}
const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
config.d1_databases[0].database_id = databaseId;
config.env.remote.d1_databases[0].database_id = databaseId;
await writeFile('wrangler.jsonc', JSON.stringify(config, null, 2) + '\n');
console.log('D1 ID configured for deployment and explicit remote migration. Development still uses local D1.');
