// test-db.mjs
// Run with: node test-db.mjs
//
// Tests the DATABASE_URL connection directly with node-postgres, with no
// Payload involved. This isolates whether a failure is coming from Neon/the
// connection string itself, or from something inside Payload's init.

import { Client } from 'pg'
import { readFileSync } from 'fs'

// Minimal .env parser so this works standalone without extra deps.
function loadEnv() {
  try {
    const text = readFileSync('.env.local', 'utf8')
    for (const line of text.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        let value = (match[2] ?? '').trim()
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
        if (!process.env[key]) process.env[key] = value
      }
    }
  } catch {
    console.warn('No .env file found next to this script — relying on already-set env vars.')
  }
}

loadEnv()

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set (checked .env and process.env).')
  process.exit(1)
}

console.log('Connecting to:', url.replace(/:[^:@]*@/, ':****@')) // hide password in log

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  console.log('Connected successfully.')
  const res = await client.query('select now()')
  console.log('Server time:', res.rows[0].now)
} catch (err) {
  console.error('Connection FAILED:')
  console.error(err)
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}
