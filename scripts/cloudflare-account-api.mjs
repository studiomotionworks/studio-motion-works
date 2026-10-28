import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Reuse Wrangler's local OAuth session in memory. Never print or persist tokens.
export async function cloudflareAPI(resource, options = {}) {
  const config = await readFile(path.join(process.env.APPDATA, 'xdg.config/.wrangler/config/default.toml'), 'utf8');
  const rawToken = config.match(/^oauth_token\s*=\s*(".*")\s*$/m)?.[1];
  if (!rawToken) throw new Error('Wrangler OAuth session is missing.');
  const response = await fetch(`https://api.cloudflare.com/client/v4${resource}`, {
    ...options,
    headers: { Authorization: `Bearer ${JSON.parse(rawToken)}`, 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json();
  if (!data.success) {
    const error = new Error(`Cloudflare API ${response.status}: ${data.errors?.map(({ code, message }) => `${code}: ${message}`).join('; ')}`);
    error.status = response.status;
    error.codes = data.errors?.map(({ code }) => code);
    throw error;
  }
  return data.result;
}
