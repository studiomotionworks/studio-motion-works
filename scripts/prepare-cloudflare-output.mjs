import fs from 'node:fs';
import path from 'node:path';

fs.copyFileSync('public/.assetsignore', '.open-next/assets/.assetsignore');
if (process.platform === 'win32') {
  const handler = path.resolve('.open-next/server-functions/default/handler.mjs');
  const code = fs.readFileSync(handler, 'utf8');
  let count = 0;
  const patched = code.replace(/import\((["'])([A-Za-z]:\/[^"']+\.(?:bin|wasm))\1\)/g, (match, _quote, target) => {
    const relative = path.relative(path.dirname(handler), target).replaceAll('\\', '/');
    if (relative.startsWith('../') || !fs.existsSync(target)) throw new Error('Invalid generated binary import.');
    count++;
    return `import(${JSON.stringify(`./${relative}`)})`;
  });
  fs.writeFileSync(handler, patched);
  console.log(`Prepared Windows binary imports: ${count}.`);
}
