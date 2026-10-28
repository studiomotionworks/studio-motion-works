# Cloudflare D1 migration

## Live deployment — October 26, 2026

- Site: https://motion-studio.motionworks-studio.workers.dev
- Admin: https://motion-studio.motionworks-studio.workers.dev/portal-access-key
- Cloudflare D1 database: `motion-studio`, ID `ed7ace24-d99f-4126-a7a8-e94312ea6aed` (APAC).
- Worker version: `546a070f-2026-40d6-8081-d07302c2b5c6`.
- A fresh read-only Neon snapshot was imported: 113 rows across 21 tables, with
  all counts, content checksums, and foreign keys verified remotely.
- Existing Payload/R2 secrets are configured on the Worker. R2 CORS now includes
  its exact workers.dev origin alongside all previous origins and permissions.
- Live homepage, blog, article, events, gallery, projects API, and admin login
  page returned HTTP 200. Existing image/video objects returned HTTP 200, the
  upload preflight returned HTTP 204, and unauthenticated users API returned 403.
- Actual password login and an authenticated upload still need user review.
  Existing password hashes and the Payload secret were preserved.
- The user chose to retain the current `motionworks.in` and `www.motionworks.in`
  deployment while reviewing the Cloudflare URL. No domain/DNS cutover occurred.
  Neon remains available as a backup; the old deployment and D1 do not sync edits.
- No subscription or billing settings were changed. Only database contents are
  transferred; existing R2 objects remain in their existing bucket.

Use `node --env-file=.env.local scripts/sync-cloudflare-secrets.mjs` to update the
Worker's secrets via stdin without writing them to a temporary file. Account
setup helpers use Wrangler's existing OAuth session only on the local machine.

## Architecture

The app uses Payload's official `@payloadcms/db-d1-sqlite` adapter and OpenNext's
Cloudflare Workers adapter, following Payload's D1 template. R2 objects remain in
the existing bucket; the transfer copies database records and their existing
object paths. PostgreSQL migrations in the parent `migrations/` directory are
retained as history. D1 uses only `migrations/d1/`.

## Local development

Use the existing `.env.local` values (see `.env.example`). Keep `PAYLOAD_SECRET`
unchanged so the migration does not change token signing configuration.

```powershell
npm run db:migrate:local
npm run dev
```

Development uses local D1 under ignored `.wrangler/`, never production D1.
Cloudflare account authentication is not required for local development. R2 still
uses the configured bucket, so uploading, moving, or deleting media affects that
bucket even in local development.

## Transfer and deploy

1. Sign in to the account containing the existing R2 bucket:

   ```powershell
   .\node_modules\.bin\wrangler.cmd login
   .\node_modules\.bin\wrangler.cmd whoami
   ```

2. Create D1 on that account, then configure the returned database UUID:

   ```powershell
   .\node_modules\.bin\wrangler.cmd d1 create motion-studio
   node scripts/configure-d1.mjs <database_id>
   ```

3. Apply the schema to local D1 and create a read-only Neon snapshot:

   ```powershell
   npm run db:migrate:local
   npm run db:export:neon
   node scripts/verify-d1-import.mjs --import
   npm run db:verify:local
   ```

   These local steps have already succeeded for the initial 113-row snapshot.
   `.data/neon-d1-snapshot.json` contains private data, including password hashes.
   It is ignored by Git. Export refuses to overwrite it. Before a final cutover,
   stop CMS edits, archive this snapshot outside the checkout, and export again
   if Neon has changed. The import requires empty destination tables. Sessions,
   edit locks, and PostgreSQL migration history are excluded; sign in again after
   the move. IDs, password hashes, preferences, content, relationships, dates,
   JSON fields, and media paths are preserved.

4. Apply the schema and import into Cloudflare D1:

   ```powershell
   npm run db:migrate:remote
   node scripts/verify-d1-import.mjs --import --remote
   node scripts/verify-d1-import.mjs --remote
   ```

   Imports use one D1 transaction and refuse nonempty targets. Every table's count
   and content checksum, plus foreign keys, are checked. Snapshots over 16 MB need
   a separately reviewed chunked import. The transfer never writes to Neon or R2.

5. Add Worker secrets using Wrangler's interactive prompts. Use existing values:

   ```powershell
   .\node_modules\.bin\wrangler.cmd secret put PAYLOAD_SECRET
   .\node_modules\.bin\wrangler.cmd secret put R2_ACCOUNT_ID
   .\node_modules\.bin\wrangler.cmd secret put R2_BUCKET
   .\node_modules\.bin\wrangler.cmd secret put R2_ACCESS_KEY_ID
   .\node_modules\.bin\wrangler.cmd secret put R2_SECRET_ACCESS_KEY
   .\node_modules\.bin\wrangler.cmd secret put R2_PUBLIC_URL
   ```

   `NEXT_PUBLIC_MEDIA_URL` must be present at build time in `.env.local` or the
   build environment. `DATABASE_URL` is used only for export and is not a Worker
   secret. For local Worker preview, copy `.dev.vars.example` to `.dev.vars` and
   populate its variables. The development server already reads `.env.local`.

6. Build and inspect the actual Worker bundle before deployment:

   ```powershell
   npm run build:cloudflare
   .\node_modules\.bin\wrangler.cmd deploy --dry-run
   npm run preview:cloudflare
   ```

   A D1 free allowance does not guarantee that this Next.js + Payload Worker fits
   Workers Free. Check the uncompressed bundle and request CPU against the account's
   plan. Do not enable a paid plan automatically. OpenNext recommends Linux/WSL
   for builds. The local CLI wrapper uses directory junctions on Windows to avoid
   requiring administrator privileges for pnpm's directory links; other Windows
   compatibility issues may still need a Linux CI environment.
   The wrapper also preserves pnpm's hoisted aliases and converts generated
   Windows binary imports to relative imports. `public/.assetsignore` excludes
   the unused 39 MB `home-gallery/firefly.jpg` source image; the homepage uses its
   R2 video instead. The original image remains in the checkout.

7. Verify admin login, public projects/events/blog, and media in the Worker preview.
   Upload a temporary image/video and confirm its metadata and folder, then test
   a folder move and deletion. Only after those checks deploy:

   ```powershell
   npm run deploy:cloudflare
   ```

   Check the returned workers.dev URL before changing the site's custom domain.
   If the bucket restricts CORS origins, allow the new site origin before upload
   testing (see `docs/media-uploads.md`). Keep Neon and the previous deployment
   available until the new site has been verified. A rollback after D1 receives
   new edits requires reconciling those edits; the two databases do not sync.

## Image and caching behavior

Workers cannot load native `sharp`. The CMS retains original uploads, without
server cropping or generated image sizes. Next.js images are served unoptimized
from their existing source, so no Cloudflare Images paid binding is required.
Crop images before upload. Local sharp processing tests remain available for the
legacy Node processing helper, but that helper is not imported by the Worker.

Database-backed pages render on each request so deployment cannot publish empty
prerendered pages from the local database. This avoids requiring an ISR cache
bucket but increases D1 reads and Worker CPU compared with cached pages. Marketing
pages can still be static. CMS save hooks retain their existing revalidation calls.

## Validation commands

```powershell
node scripts/test-d1-transfer.mjs
.\node_modules\.bin\tsc.cmd --noEmit
npm run test:media-folders
npm run test:media-move
node scripts/test-content-revalidation.mjs
.\node_modules\.bin\payload.cmd run scripts/smoke-d1.ts
```

Local validation completed: 113 rows across 21 tables matched the Neon snapshot;
Payload populated relationships for 1 user, 2 media files, 6 posts, 6 projects,
and 8 events. The local Worker returned HTTP 200 for the homepage, blog, article,
events, gallery, admin login, and projects API. Anonymous users-list and upload
signer requests returned HTTP 403. Wrangler's deployment dry run passed with
17,238.62 KiB uncompressed (3,952.74 KiB gzip). Production authentication, account
limits, CORS, admin login, and upload writes must still be checked after sign-in.

References:
- https://payloadcms.com/docs/database/sqlite#d1-database
- https://github.com/payloadcms/payload/tree/main/templates/with-cloudflare-d1
- https://opennext.js.org/cloudflare/get-started
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/workers/platform/limits/
