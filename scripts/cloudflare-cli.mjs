import fs from 'node:fs';
import path from 'node:path';
import { createRequire, syncBuiltinESMExports } from 'node:module';
import { pathToFileURL } from 'node:url';

// OpenNext recreates pnpm directory links without specifying their type.
// Windows directory junctions don't require Developer Mode or administrator
// privileges. This changes only this build process, never installed packages.
if (process.platform === 'win32') {
  const original = fs.symlinkSync;
  const preparedOutputs = new Set();
  const mirrorHoistedLinks = (output) => {
    if (preparedOutputs.has(output)) return;
    preparedOutputs.add(output);
    const source = path.resolve('node_modules/.pnpm/node_modules');
    const visit = (directory) => {
      if (!fs.existsSync(directory)) return;
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const link = path.join(directory, entry.name);
        if (!entry.isSymbolicLink()) {
          if (entry.isDirectory() && entry.name.startsWith('@')) visit(link);
          continue;
        }
        const target = fs.realpathSync(link);
        const relative = path.relative(process.cwd(), target);
        if (relative.startsWith('..') || path.isAbsolute(relative)) continue;
        const destination = path.join(output, 'node_modules/.pnpm/node_modules', path.relative(source, link));
        if (fs.existsSync(destination)) continue;
        const rebased = path.join(output, relative);
        fs.mkdirSync(rebased, { recursive: true });
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        original(rebased, destination, 'junction');
      }
    };
    visit(source);
  };
  fs.symlinkSync = (target, destination, type) => {
    const resolved = path.resolve(path.dirname(String(destination)), String(target));
    if (!type && fs.statSync(resolved).isDirectory()) {
      // pnpm's Windows links are absolute. Rebase them into the traced output
      // so the Worker uses OpenNext's patched copies rather than source files.
      const output = String(destination).match(/^(.*[\\/]\.open-next[\\/]server-functions[\\/][^\\/]+)[\\/]/)?.[1];
      let rebased = resolved;
      if (output) {
        for (const source of [path.resolve('.next/standalone'), process.cwd()]) {
          const relative = path.relative(source, resolved);
          if (!relative.startsWith('..') && !path.isAbsolute(relative)) {
            rebased = path.join(output, relative);
            break;
          }
        }
        fs.mkdirSync(rebased, { recursive: true });
        mirrorHoistedLinks(output);
      }
      return original(rebased, destination, 'junction');
    }
    return original(target, destination, type);
  };
  syncBuiltinESMExports();
}

const require = createRequire(import.meta.url);
const entry = path.resolve(path.dirname(require.resolve('@opennextjs/cloudflare')), '../cli/index.js');
await import(pathToFileURL(entry).href);

if (process.argv[2] === 'build') {
  await import('./prepare-cloudflare-output.mjs');
}
