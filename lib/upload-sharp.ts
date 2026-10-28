import sharp from "sharp";

// Payload rewrites and deletes client-upload temp files after image processing.
// libvips' operation cache keeps their handles open, which locks them on Windows.
if (process.platform === "win32") {
  sharp.cache(false);
}

export default sharp;
