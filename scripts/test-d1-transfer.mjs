import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { fingerprint, quoteIdentifier, skipTable, toSQLiteValue } from './d1-transfer-utils.mjs';

assert.equal(toSQLiteValue(true), 1);
assert.equal(toSQLiteValue(false), 0);
assert.equal(toSQLiteValue(new Date('2026-10-26T12:00:00Z')), '2026-10-26T12:00:00.000Z');
assert.equal(toSQLiteValue({ text: "it's motion", blocks: [1, 2] }), '{"text":"it\'s motion","blocks":[1,2]}');
assert.throws(() => toSQLiteValue(Buffer.from([1, 2])), /Binary/);
assert.throws(() => toSQLiteValue(NaN), /Non-finite/);
assert.equal(quoteIdentifier('a"b'), '"a""b"');
assert.ok(skipTable('payload_migrations'));
assert.ok(skipTable('users_sessions'));
assert.equal(skipTable('users'), false);

const db = new DatabaseSync(':memory:');
try {
  db.exec('PRAGMA foreign_keys=ON; CREATE TABLE users(id INTEGER PRIMARY KEY, hash TEXT, active INTEGER, content TEXT); CREATE TABLE posts(id INTEGER PRIMARY KEY, author_id INTEGER REFERENCES users(id)); BEGIN; PRAGMA defer_foreign_keys=ON;');
  db.prepare('INSERT INTO posts VALUES(?, ?)').run(20, 7);
  const original = { id: 7, hash: 'preserved-password-hash', active: toSQLiteValue(true), content: toSQLiteValue({ quote: "it's intact" }) };
  db.prepare('INSERT INTO users VALUES(?, ?, ?, ?)').run(...Object.values(original));
  db.exec('COMMIT;');
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
  const columns = ['id', 'hash', 'active', 'content'];
  const stored = db.prepare('SELECT * FROM users').all();
  assert.equal(fingerprint(columns, [original]), fingerprint(columns, stored));
  assert.notEqual(fingerprint(columns, [original]), fingerprint(columns, [{ ...original, hash: 'changed' }]));
  assert.equal(fingerprint(['id'], [{ id: 1 }, { id: 2 }]), fingerprint(['id'], [{ id: 2 }, { id: 1 }]));
  assert.throws(() => db.prepare('INSERT INTO posts VALUES(?, ?)').run(21, 999), /FOREIGN KEY/);
  console.log('D1 transfer: conversion, preserved hashes, content checksums, ordering, and foreign keys passed.');
} finally { db.close(); }
