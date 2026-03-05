/**
 * Capture the chart canvas as an animated GIF.
 * Records ~2s of frames then encodes to a downloadable blob.
 * @param {HTMLCanvasElement} canvas - The chart <canvas> element
 * @param {object} [opts]
 * @param {number} [opts.fps=10] - Frames per second
 * @param {number} [opts.duration=2000] - Recording duration in ms
 * @param {number} [opts.width=800] - Output width
 * @returns {Promise<Blob>}
 */
export async function captureGif(canvas, opts = {}) {
  const { fps = 10, duration = 2000, width = 800 } = opts;
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
  const scale = width / canvas.width;
  const height = Math.round(canvas.height * scale);
  const delay = Math.round(1000 / fps);
  const totalFrames = Math.ceil(duration / delay);

  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');

  const gif = GIFEncoder();

  for (let i = 0; i < totalFrames; i++) {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(canvas, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const palette = quantize(imageData.data, 256);
    const index = applyPalette(imageData.data, palette);
    gif.writeFrame(index, width, height, { palette, delay });
    // yield to main thread between frames
    if (i < totalFrames - 1) {
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  gif.finish();
  return new Blob([gif.bytes()], { type: 'image/gif' });
}
