import { cloudflareAPI } from './cloudflare-account-api.mjs';

const resource = `/accounts/${process.env.R2_ACCOUNT_ID}/workers/subdomain`;
let existing;
try { existing = await cloudflareAPI(resource); }
catch (error) { if (error.status !== 404 && !error.codes?.some((code) => [10007, 10063, 10030].includes(code))) throw error; }
if (existing?.subdomain) console.log(`Existing workers.dev subdomain retained: ${existing.subdomain}`);
else {
  const result = await cloudflareAPI(resource, { method: 'PUT', body: JSON.stringify({ subdomain: 'motionworks-studio' }) });
  console.log(`Registered workers.dev subdomain: ${result.subdomain}`);
}
