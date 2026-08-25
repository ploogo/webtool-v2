/**
 * Canvas encoding support varies by browser: asking for an unsupported type
 * silently yields a PNG, which used to produce files named `.avif` that were
 * really PNGs.
 */
const supportCache = new Map<string, boolean>();

export function isFormatSupported(format: string): boolean {
  const cached = supportCache.get(format);
  if (cached !== undefined) return cached;

  let supported = false;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    supported = canvas.toDataURL(`image/${format}`).startsWith(`data:image/${format}`);
  } catch {
    supported = false;
  }

  supportCache.set(format, supported);
  return supported;
}

/** The extension matching what a canvas actually encoded, not what was requested. */
export function extensionForDataUrl(dataUrl: string, requestedFormat: string): string {
  const match = dataUrl.match(/^data:image\/([a-z0-9.+-]+)/i);
  return match ? match[1].toLowerCase() : requestedFormat;
}
