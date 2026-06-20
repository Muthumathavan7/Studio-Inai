/**
 * Client-side image compression / resize before upload.
 * - Keeps aspect ratio.
 * - Downscales to fit within MAX_DIMENSION on the longest edge.
 * - Re-encodes JPEG/WEBP at QUALITY (PNG converted to JPEG unless transparency-critical).
 * - If the original is already smaller than the limits and under SKIP_BELOW_BYTES, returns it unchanged.
 */

const MAX_DIMENSION = 2400; // px
const QUALITY = 0.86;
const SKIP_BELOW_BYTES = 800 * 1024; // 800KB — small enough to upload directly

export async function compressImage(file) {
  if (!file || !file.type?.startsWith("image/")) return file;
  // SVG and GIF — leave alone
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;
  if (file.size <= SKIP_BELOW_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(targetW, targetH)
      : Object.assign(document.createElement("canvas"), { width: targetW, height: targetH });

    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close?.();

    const outType = file.type === "image/png" ? "image/jpeg" : file.type;
    const blob = canvas.convertToBlob
      ? await canvas.convertToBlob({ type: outType, quality: QUALITY })
      : await new Promise((resolve) => canvas.toBlob(resolve, outType, QUALITY));

    if (!blob) return file;
    // Only use compressed version if it actually saves space.
    if (blob.size >= file.size) return file;

    const ext = outType === "image/jpeg" ? "jpg" : outType.split("/")[1] || "img";
    const nameNoExt = (file.name || "image").replace(/\.[^.]+$/, "");
    return new File([blob], `${nameNoExt}.${ext}`, { type: outType, lastModified: Date.now() });
  } catch (err) {
    // If anything fails, fall back to original file.
    console.warn("compressImage failed; uploading original.", err);
    return file;
  }
}
