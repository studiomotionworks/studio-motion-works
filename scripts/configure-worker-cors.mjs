import { cloudflareAPI } from './cloudflare-account-api.mjs';

const origin = 'https://motion-studio.motionworks-studio.workers.dev';
const resource = `/accounts/${process.env.R2_ACCOUNT_ID}/r2/buckets/${process.env.R2_BUCKET}/cors`;
const policy = await cloudflareAPI(resource);
const rule = policy.rules?.find(({ allowed }) => allowed.methods.includes('PUT'));
if (!rule) throw new Error('No existing upload CORS rule found.');
if (!rule.allowed.origins.includes(origin) && !rule.allowed.origins.includes('*')) {
  rule.allowed.origins.push(origin);
  await cloudflareAPI(resource, { method: 'PUT', body: JSON.stringify(policy) });
}
const verified = await cloudflareAPI(resource);
if (!verified.rules.some(({ allowed }) => allowed.methods.includes('PUT') && (allowed.origins.includes(origin) || allowed.origins.includes('*')))) throw new Error('CORS verification failed.');
console.log('Worker origin added to the existing R2 upload CORS rule; existing origins and permissions retained.');
