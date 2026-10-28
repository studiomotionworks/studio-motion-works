// Workaround for https://github.com/payloadcms/payload/issues/17545.
// Payload ships AuthProvider separately AND in its public client bundle.
// Render public admin views during SSR while keeping the session refresh and
// server-side permissions intact. Revisit this when upgrading Payload.
// Also skip document preference reads until new records have an ID/key.
import { createRequire } from 'node:module';
import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const payloadRequire = createRequire(require.resolve('@payloadcms/next/layouts'));
const clientBundle = payloadRequire.resolve('@payloadcms/ui');
const packageDir = resolve(dirname(clientBundle), '../../..');
const { version } = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8'));

if (version !== '3.90.2') {
  console.warn(`Payload UI ${version}: review the admin rendering and preference workarounds.`);
} else {
  const changes = [
    {
      file: clientBundle,
      before: '!g&&!D?null:oj(C3,{value:{fetchFullUser:V',
      after: '!g&&!D&&!s.unauthenticated?null:oj(C3,{value:{fetchFullUser:V',
    },
    {
      file: resolve(packageDir, 'dist/providers/Auth/index.js'),
      before: 'if (!user && !fetchedUserOnMount) {',
      after: 'if (!user && !fetchedUserOnMount && !config.unauthenticated) {',
    },
    {
      file: clientBundle,
      before: 'q=Cl(()=>pe(oe),[pe,oe])',
      after: 'q=Cl(()=>oe?pe(oe):Promise.resolve(null),[pe,oe])',
    },
    {
      file: resolve(packageDir, 'dist/providers/DocumentInfo/index.js'),
      before: 'return getPreference(preferencesKey);',
      after: 'return preferencesKey ? getPreference(preferencesKey) : Promise.resolve(null);',
    },
  ];

  // Validate every patch before writing any file. Fail visibly if the
  // package contents change instead of silently leaving the login page blank.
  const files = new Map();
  for (const { file, before, after } of changes) {
    const source = files.get(file) ?? readFileSync(file, 'utf8');
    if (!source.includes(after) && source.split(before).length !== 2) {
      throw new Error(`Cannot apply Payload UI workaround to ${file}`);
    }
    // A bundle can contain more than one patch; apply them cumulatively.
    files.set(file, source.includes(after) ? source : source.replace(before, after));
  }
  for (const [file, source] of files) {
    // Replace the file so pnpm's shared-store hard links are not modified.
    const temporaryFile = `${file}.motion-studio-tmp`;
    writeFileSync(temporaryFile, source);
    renameSync(temporaryFile, file);
  }
  console.log('Applied Payload UI admin rendering and document preference workarounds.');
}
