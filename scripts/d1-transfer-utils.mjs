import { createHash } from 'node:crypto';

export const quoteIdentifier = (name) => `"${name.replaceAll('"', '""')}"`;
export const skipTable = (name) => name === 'payload_migrations' || name.startsWith('payload_locked_documents') || name.endsWith('_sessions');

export function toSQLiteValue(value) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'boolean') return Number(value);
  if (typeof value === 'object') {
    if (Buffer.isBuffer(value)) throw new Error('Binary database columns require an explicit conversion.');
    return JSON.stringify(value);
  }
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Non-finite SQL number.');
  return value;
}

export function fingerprint(columns, rows) {
  const records = rows.map((row) => JSON.stringify(columns.map((column) => row[column] ?? null))).sort();
  return createHash('sha256').update(JSON.stringify({ columns, records })).digest('hex');
}

export async function readSchema(db) {
  const { results } = await db.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name").all();
  const tables = results.filter(({ name }) => !skipTable(name));
  if (!tables.some(({ name }) => name === 'users')) throw new Error('Apply the D1 schema migration first.');
  return tables;
}

export function schemaFingerprint(tables) {
  return createHash('sha256').update(JSON.stringify(tables)).digest('hex');
}
