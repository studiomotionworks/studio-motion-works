import assert from 'node:assert/strict';
import { mkdtemp, rmdir, unlink } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from '../lib/upload-sharp.ts';

const require = createRequire(import.meta.url);
const payloadDir = path.dirname(require.resolve('payload'));
const { getFileFromClientUpload } = await import(pathToFileURL(path.join(payloadDir, 'uploads/getFileFromClientUpload.js')));
const { generateFileData } = await import(pathToFileURL(path.join(payloadDir, 'uploads/generateFileData.js')));
const directory = await mkdtemp(path.join(tmpdir(), 'motion-studio-media-processing-'));

try {
  // Exercise both the crop rewrite and the GIF rewrite, plus ordinary resizing.
  for (const format of ['jpeg', 'png', 'gif']) {
    const bytes = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: '#c5a065' },
    }).toFormat(format).toBuffer();
    const mimeType = `image/${format}`;
    const upload = {
      disableLocalStorage: true,
      mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
      focalPoint: false,
      staticDir: directory,
      handlers: [async () => new Response(bytes, { headers: { 'Content-Type': mimeType } })],
    };
    const req = {
      headers: new Headers(),
      query: format === 'jpeg' ? {
        uploadEdits: { crop: { x: 0, y: 0 }, widthInPixels: 600, heightInPixels: 400 },
      } : {},
      payload: {
        collections: { media: { config: { upload } } },
        config: { sharp, upload: { tempFileDir: directory } },
        db: { findOne: async () => null },
        logger: { error: (error) => console.error(error) },
      },
    };
    const file = await getFileFromClientUpload({
      req,
      file: { collectionSlug: 'media', filename: `sample.${format}`, mimeType, size: bytes.length, clientUploadContext: {} },
    });
    req.file = file;
    try {
      const result = await generateFileData({
        collection: { config: { slug: 'media', upload } },
        data: { prefix: 'media' },
        operation: 'create',
        req,
        throwOnMissingFile: true,
      });
      assert.equal(result.data.mimeType, mimeType);
      assert.equal(result.data.width, format === 'jpeg' ? 600 : 1200);
      assert.equal(result.data.filename, `sample.${format}`);
      assert.equal(result.data.sizes, undefined);
      assert.equal(req.payloadUploadSizes, undefined);
    } finally {
      // No retries or cache flush: the upload must release the file itself.
      await unlink(file.tempFilePath);
    }
    console.log(`${format}: original image processing, no extra sizes, and temp-file cleanup passed`);
  }
} finally {
  await rmdir(directory);
}
