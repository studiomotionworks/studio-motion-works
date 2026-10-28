import assert from 'node:assert/strict';
import nodeModule, { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const payloadRequire = createRequire(require.resolve('payload'));
nodeModule.registerHooks = undefined;
const { tsImport } = await import(pathToFileURL(payloadRequire.resolve('tsx/esm/api')));
const { createContentRevalidationHooks } = await tsImport('../lib/revalidate-content.ts', import.meta.url);
const calls = [];
const warnings = [];
const hooks = createContentRevalidationHooks((...args) => calls.push(args));
const req = { payload: { logger: { warn: warning => warnings.push(warning) } } };
const doc = { id: 1, slug: 'new-slug' };
const run = (collection, operation = 'afterChange') => {
  calls.length = 0;
  assert.equal(hooks[operation]({ collection: { slug: collection }, doc, previousDoc: { slug: 'old-slug' }, req }), doc);
  return [...calls];
};
assert.deepEqual(run('projects'), [['/gallery-motions']]);
assert.deepEqual(run('events', 'afterDelete'), [['/events']]);
assert.deepEqual(run('posts'), [['/blog'], ['/blog/new-slug'], ['/blog/old-slug']]);
assert.deepEqual(run('posts', 'afterDelete'), [['/blog'], ['/blog/new-slug']]);
assert.deepEqual(run('media'), [['/gallery-motions'], ['/events'], ['/blog'], ['/blog/[slug]', 'page']]);
assert.deepEqual(run('media', 'afterDelete'), [['/gallery-motions'], ['/events'], ['/blog'], ['/blog/[slug]', 'page']]);
const failingHooks = createContentRevalidationHooks(() => { throw new Error('No Next request context'); });
assert.equal(failingHooks.afterChange({ collection: { slug: 'projects' }, doc, req }), doc);
assert.equal(warnings.length, 1);
console.log('Content saves/deletes, moved media, post slug changes, and cache-failure save handling passed.');
