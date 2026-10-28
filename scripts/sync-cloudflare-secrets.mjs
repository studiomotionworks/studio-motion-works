import { spawn } from 'node:child_process';
import path from 'node:path';

const keys = ['PAYLOAD_SECRET', 'R2_ACCOUNT_ID', 'R2_BUCKET', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_PUBLIC_URL'];
const secrets = Object.fromEntries(keys.map((key) => {
  if (!process.env[key]) throw new Error(`Missing ${key}. Load .env.local before running this command.`);
  return [key, process.env[key]];
}));
const child = spawn(process.execPath, [path.resolve('node_modules/wrangler/bin/wrangler.js'), 'secret', 'bulk', '--name', 'motion-studio'], {
  env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: process.env.R2_ACCOUNT_ID },
  stdio: ['pipe', 'inherit', 'inherit'],
});
child.stdin.end(JSON.stringify(secrets));
child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 1; });
