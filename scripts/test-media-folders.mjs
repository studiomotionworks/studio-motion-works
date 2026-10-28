import assert from 'node:assert/strict';
import nodeModule, { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { verifyClientUploadReceipt } from 'payload/internal';
import { S3Client } from '@aws-sdk/client-s3';
import { mediaFolderForRecord, normalizeMediaUploadFolder } from '../lib/media-folders.ts';

// Use Payload's TS loader, including its Node 24 compatibility workaround.
const require = createRequire(import.meta.url);
const payloadRequire = createRequire(require.resolve('payload'));
nodeModule.registerHooks = undefined;
const { tsImport } = await import(pathToFileURL(payloadRequire.resolve('tsx/esm/api')));
const { createMediaUploadSigner, signGroupedMediaUpload, groupedMediaStorage } = await tsImport('../lib/grouped-media-storage.ts', import.meta.url);
const { Media } = await tsImport('../collections/Media.ts', import.meta.url);
assert.equal(Media.upload.imageSizes, undefined);
assert.equal(Media.upload.focalPoint, false);
const storageRequire = createRequire(require.resolve('@payloadcms/storage-s3'));
const { getStorageFilePath, verifyClientUploadReceiptForFileKey } = await import(pathToFileURL(storageRequire.resolve('@payloadcms/plugin-cloud-storage/utilities')));

// Signing is local; no bucket, database, credentials, or network writes are used.
process.env.R2_ACCOUNT_ID = 'test-account';
process.env.R2_BUCKET = 'test-bucket';
process.env.R2_ACCESS_KEY_ID = 'test-key';
process.env.R2_SECRET_ACCESS_KEY = 'test-secret';
const signingClient = new S3Client({ region: 'auto', endpoint: 'https://test-account.r2.cloudflarestorage.com', forcePathStyle: true, credentials: { accessKeyId: 'test-key', secretAccessKey: 'test-secret' }, requestChecksumCalculation: 'WHEN_REQUIRED' });
signingClient.send = async () => { throw Object.assign(new Error('Not found'), { name: 'NotFound' }); };
const signUpload = createMediaUploadSigner(() => signingClient);

function request(body, user = { id: 1, collection: 'users' }) {
  return {
    json: async () => body,
    user,
    payload: {
      secret: 'test-receipt-secret',
      collections: { media: { config: { access: { create: () => true }, upload: {} } } },
      config: { upload: { limits: { fileSize: 1024 * 1024 } } },
      db: { findOne: async () => null },
    },
  };
}

assert.equal(mediaFolderForRecord('projects', 'Firefly Table'), 'media/projects/firefly-table');
assert.equal(mediaFolderForRecord('events', 'Milan 2026'), 'media/events/milan-2026');
assert.equal(mediaFolderForRecord('posts', 'Café Studio'), 'media/posts/cafe-studio');
assert.equal(mediaFolderForRecord('projects', ''), null);
assert.equal(mediaFolderForRecord('users', 'admin'), null);
assert.equal(normalizeMediaUploadFolder('media'), 'media/library');
for (const value of ['../private', 'media/../private', 'media/projects/../firefly', '/media/projects/firefly', 'media/projects/firefly/another-folder']) {
  assert.throws(() => normalizeMediaUploadFolder(value));
}

const body = { collectionSlug: 'media', docPrefix: 'media/projects/firefly', filename: 'cover.jpg', filesize: 5000, mimeType: 'image/jpeg' };
const req = request(body);
const first = await (await signUpload(req)).json();
const second = await (await signUpload(request(body))).json();
assert.equal(first.filename, 'cover.jpg');
assert.equal(second.filename, 'cover.jpg');
for (const [filename, mimeType] of [['firefly.webp', 'image/webp'], ['firefly.mp4', 'video/mp4']]) {
  const uploaded = await (await signUpload(request({ ...body, filename, mimeType }))).json();
  assert.equal(uploaded.filename, filename);
  assert.equal(new URL(uploaded.url).pathname, `/test-bucket/media/projects/firefly/${filename}`);
}
for (const response of [first, second]) {
  const key = `media/projects/firefly/${response.filename}`;
  assert.equal(new URL(response.url).pathname, `/test-bucket/${key}`);
  assert.equal(key.split('/').length, 4); // No per-file subdirectory.
  assert.equal(response.headers['If-None-Match'], '*');
  const receipt = verifyClientUploadReceipt({ collectionSlug: 'media', req, signedReceipt: response.clientUploadContext.signedReceipt });
  assert.deepEqual(receipt.context, { prefix: 'media/projects/firefly', _objectKey: '' });
  verifyClientUploadReceiptForFileKey({ collectionPrefix: 'media', collectionSlug: 'media', expectedFileKey: key, req, signedReceipt: response.clientUploadContext.signedReceipt });
  assert.equal(await getStorageFilePath({ collectionPrefix: 'media', filename: response.filename, clientUploadContext: receipt.context }), key);
  // Originals and derived sizes resolve within the same folder.
  assert.equal(await getStorageFilePath({ collectionPrefix: 'media', filename: 'cover-thumb.jpg', doc: receipt.context }), 'media/projects/firefly/cover-thumb.jpg');
}
const legacyDoc = { prefix: 'media', _objectKey: 'legacy-uuid' };
assert.equal(await getStorageFilePath({ collectionPrefix: 'media', filename: 'old.jpg', doc: legacyDoc }), 'media/legacy-uuid/old.jpg');
assert.throws(() => verifyClientUploadReceipt({ collectionSlug: 'media', req: request(body, { id: 2, collection: 'users' }), signedReceipt: first.clientUploadContext.signedReceipt }));
for (const changes of [{ docPrefix: 'media/../private' }, { collectionSlug: 'users' }, { filesize: -1 }, { filesize: 2000000 }]) {
  await assert.rejects(() => signUpload(request({ ...body, ...changes })));
}
await assert.rejects(() => signUpload(request(body, null)));
const library = await (await signUpload(request({ ...body, docPrefix: undefined }))).json();
assert.equal(library.docPrefix, 'media/library');
const endpoint = { path: '/storage-s3-generate-signed-url', method: 'post', handler: () => {} };
groupedMediaStorage({ endpoints: [endpoint] });
assert.equal(endpoint.handler, signGroupedMediaUpload);
const occupiedRequest = request(body);
occupiedRequest.payload.db.findOne = async () => ({ id: 8 });
await assert.rejects(() => signUpload(occupiedRequest), /already exists/);
signingClient.send = async () => ({});
await assert.rejects(() => signUpload(request(body)), /already exists/);
console.log('Title folders, original filenames, collision rejection, receipts, permissions, limits, and legacy reads passed.');
