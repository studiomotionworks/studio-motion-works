# Media uploads

Projects (`cover`, `videoFile`, `images[].image`), events (`imageFile`), and
posts (`cover`, image content blocks) all upload through the `media` collection.
It accepts images, MP4, and WebM. Each upload stores one original object; no
thumbnail/card objects are generated in R2. Gallery previews use Next's image
cache when a smaller display image is needed.

Uploads go directly from the browser to R2 to support large video files.
A successful `/api/storage-s3-generate-signed-url` response only means the upload
was authorized; the browser must then PUT the file to R2 before saving Media
and linking it to the parent document.

## Media folders

New uploads created within a project, event, or post use its title as a folder
name (lowercase, with spaces replaced by hyphens):

- `media/projects/firefly/` for a project titled Firefly, including all images and videos.
- `media/events/<event-title>/` for event images.
- `media/posts/<post-title>/` for covers and image content blocks.

Enter the title and use **Upload new media** in the record. The upload field
passes the folder as the Media drawer's initial data, including gallery array
rows and post blocks. The Media folder stays editable before uploading.
Original filenames are kept, subject to Payload's filename sanitization; no UUID
or number is appended. If that filename already exists in the same folder, the
upload fails with a conflict message rather than overwriting or renaming it.

Standalone Media uploads default to `media/library/`. Set **Media folder** to
`media/projects/your-project-slug` (or `events` / `posts`) before saving when the
file belongs to an existing record. Selecting an already uploaded file does not
move it automatically. On a saved Media record, edit **Media folder** and click
**Move to folder**. This writes the destination, updates the Media URLs, and only
then removes the source. It also saves any edited alt text. Conflicts and failed
database saves preserve the original. Existing files keep their paths until
explicitly moved; changing a record's title affects future uploads.

`groupedMediaStorage` replaces only the S3 signing endpoint after `s3Storage`.
It retains collection write-access checks, type/size validation, signed upload
receipts bound to the user and object path, and conditional PUTs. The stored
prefix fields already exist, so no database migration is needed.

Run `npm run test:media-folders` to verify grouping, original names, collision
rejection, receipts, permissions, limits, and old UUID paths. Run
`npm run test:media-move` for moves, access checks, and failure handling.

## Configure the bucket once

In Cloudflare, open **R2 → motionworks-media → Settings → CORS policy** and
paste [config/r2-cors.json](../config/r2-cors.json). Add your deployed site's
exact origin to `AllowedOrigins` before uploading from production. Preserve
any existing rules needed by other applications.

The origin includes the protocol and port, with no trailing slash or path.
R2 handles OPTIONS preflight requests automatically. `PUT` and permission for
`Content-Type` and `If-None-Match` request headers are required by Payload's
direct uploader; GET/HEAD also support previews and video range requests.
Changing CORS in Next.js or Payload does not change the R2 bucket policy.

The current application storage key can access objects but returned
`AccessDenied` for bucket CORS administration. Use the Cloudflare dashboard
with a bucket administrator account to configure it.

After changing the policy, retry with a newly selected file so Payload generates
a fresh signed URL (valid for ten minutes). Restart the app after changes to
`payload.config.ts`; when using `next start`, build again first.

## Verify

### Public page refresh

Content and Media saves/deletions invalidate their public Next.js pages through
`lib/revalidate-content.ts`. Media moves also run the save hook, so gallery,
event, and blog pages refresh their file URLs. New and previous post slugs are
invalidated when a post is renamed. Run `node scripts/test-content-revalidation.mjs`
to check these behaviors. Restart a running production server after deploying
the hooks; its existing pre-rendered page may still contain older upload URLs.

### Windows temporary-file locks

Payload downloads direct uploads to temporary files for validation and image
processing. Sharp's default libvips cache can keep those files open on Windows,
causing `UNKNOWN ... open` while Payload rewrites an image and `EBUSY ... unlink`
during cleanup. `lib/upload-sharp.ts` disables that cache on Windows before
Payload uses Sharp. Restart the server after changing it; for `next start`,
rebuild first. No temporary-directory permission changes are needed.

Run `npm run test:media` to exercise Payload's temporary-file processing,
JPEG cropping, PNG/GIF processing, no extra image sizes, and immediate cleanup.

### Uploads and document saves

Migration `20261024_004500_allow_uploaded_images_without_legacy_urls` removes old
NOT NULL constraints from `projects_images.src` and `posts_blocks_image.src`.
Those URLs are optional when the corresponding Media upload is selected. The
repair preserves existing rows, URLs, and uploaded files.

1. The browser's OPTIONS request to R2 succeeds and allows the current origin,
   PUT, and the requested headers.
2. The PUT succeeds for an image and for an MP4/WebM video.
3. Media saves, image previews display, and R2 contains only the original upload.
4. Project cover/gallery/video, event image, and post cover/content images save,
   and remain populated after reloading their parent documents.

References: [Cloudflare CORS](https://developers.cloudflare.com/r2/buckets/cors/),
[AWS checksum settings](https://docs.aws.amazon.com/sdkref/latest/guide/feature-dataintegrity.html).
