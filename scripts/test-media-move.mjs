import assert from 'node:assert/strict';
import nodeModule, { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const payloadRequire = createRequire(require.resolve('payload'));
nodeModule.registerHooks = undefined;
const { tsImport } = await import(pathToFileURL(payloadRequire.resolve('tsx/esm/api')));
const { createMediaFolderMover } = await tsImport('../lib/move-media-folder.ts', import.meta.url);

function setup({ deny = false, databaseFailure = false, occupied = false, legacy = false } = {}) {
  const sourceFolder = legacy ? 'media/old-uuid' : 'media/library';
  const sourceKey = `${sourceFolder}/firefly.webp`;
  const targetKey = 'media/projects/firefly/firefly.webp';
  const objects = new Map([[sourceKey, Buffer.from('original-file-bytes')]]);
  if (occupied) objects.set(targetKey, Buffer.from('another-file'));
  const doc = { id: 9, prefix: legacy ? 'media' : 'media/library', _objectKey: legacy ? 'old-uuid' : '', filename: 'firefly.webp', alt: 'Before' };
  let saved = false;
  const client = {
    send: async (command) => {
      const { Key, Body, IfNoneMatch } = command.input;
      if (command.constructor.name === 'HeadObjectCommand') {
        if (!objects.has(Key)) throw Object.assign(new Error('Missing'), { name: 'NotFound' });
        return {};
      }
      if (command.constructor.name === 'GetObjectCommand') {
        assert.ok(objects.has(Key));
        return { Body: objects.get(Key), ContentLength: objects.get(Key).length, ContentType: 'image/webp' };
      }
      if (command.constructor.name === 'PutObjectCommand') {
        assert.equal(IfNoneMatch, '*');
        assert.ok(!objects.has(Key));
        objects.set(Key, Body);
        return {};
      }
      if (command.constructor.name === 'DeleteObjectCommand') {
        if (Key === sourceKey) assert.ok(saved, 'Source must survive until metadata saves');
        objects.delete(Key);
        return {};
      }
      throw new Error('Unexpected storage operation');
    },
  };
  const req = {
    user: { id: 1 }, routeParams: { id: '9' },
    json: async () => ({ prefix: 'media/projects/firefly', alt: 'Updated alt' }),
    payload: {
      collections: { media: { config: { access: { update: () => !deny } } } },
      findByID: async () => doc,
      update: async ({ data }) => {
        assert.ok(objects.has(sourceKey));
        assert.ok(objects.has(targetKey));
        if (databaseFailure) throw new Error('Database save failed');
        saved = true;
        return { ...doc, ...data };
      },
      logger: { error: () => assert.fail('Unexpected cleanup failure') },
    },
  };
  return { req, objects, sourceKey, targetKey, move: createMediaFolderMover(() => client) };
}

for (const legacy of [false, true]) {
  const test = setup({ legacy });
  const result = await (await test.move(test.req)).json();
  assert.equal(result.doc.prefix, 'media/projects/firefly');
  assert.equal(result.doc.filename, 'firefly.webp');
  assert.equal(result.doc._objectKey, '');
  assert.equal(result.doc.alt, 'Updated alt');
  assert.equal(test.objects.has(test.sourceKey), false);
  assert.equal(test.objects.get(test.targetKey).toString(), 'original-file-bytes');
}
for (const options of [{ deny: true }, { databaseFailure: true }, { occupied: true }]) {
  const test = setup(options);
  await assert.rejects(() => test.move(test.req));
  assert.ok(test.objects.has(test.sourceKey));
  if (!options.occupied) assert.equal(test.objects.has(test.targetKey), false);
  else assert.equal(test.objects.get(test.targetKey).toString(), 'another-file');
}
const guest = setup();
guest.req.user = null;
await assert.rejects(() => guest.move(guest.req));
console.log('Folder moves preserve filenames and bytes, enforce access/collisions, and retain sources if saving fails.');
