export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RasterResult {
  imageData: ImageData;
  /** True when the requested size had to be reduced to fit browser canvas limits. */
  clamped: boolean;
}

export interface PreparedSVG {
  /** Serialized SVG with explicit dimensions, ready to rasterize. */
  markup: string;
  width: number;
  height: number;
  /** Whether a background shape or style was stripped. */
  removedBackground: boolean;
}

// Safari refuses to draw canvases above ~16.7M pixels, so cap there.
const MAX_CANVAS_AREA = 16_777_216;
const MAX_CANVAS_SIDE = 8192;

// What a browser uses for an <svg> with no usable size.
const DEFAULT_SVG_SIZE = { width: 300, height: 150 };

export function isSVGFile(file: File): boolean {
  return file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
}

function parseLength(value: string | null): number | null {
  if (!value) return null;
  // Percentages and font-relative units have no meaning outside a page.
  const match = value.trim().match(/^([\d.]+)(px)?$/);
  if (!match) return null;
  const n = parseFloat(match[1]);
  return n > 0 ? n : null;
}

function parseViewBox(svg: SVGSVGElement): [number, number, number, number] | null {
  const raw = svg.getAttribute('viewBox');
  if (!raw) return null;
  const parts = raw.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN) || parts[2] <= 0 || parts[3] <= 0) {
    return null;
  }
  return parts as [number, number, number, number];
}

function near(a: number, b: number): boolean {
  return Math.abs(a - b) <= Math.max(0.5, Math.abs(b) * 0.005);
}

/** A rect that covers the whole canvas, either as 100% or as the viewBox size. */
function isFullCanvasRect(
  rect: Element,
  viewBox: [number, number, number, number] | null,
  width: number,
  height: number
): boolean {
  const w = rect.getAttribute('width');
  const h = rect.getAttribute('height');
  if (w === '100%' && h === '100%') return true;

  const [vx, vy, vw, vh] = viewBox ?? [0, 0, width, height];
  const x = parseFloat(rect.getAttribute('x') ?? '0') || 0;
  const y = parseFloat(rect.getAttribute('y') ?? '0') || 0;
  const rw = parseFloat(w ?? '');
  const rh = parseFloat(h ?? '');
  return (
    !Number.isNaN(rw) &&
    !Number.isNaN(rh) &&
    x <= vx + 0.5 &&
    y <= vy + 0.5 &&
    x + rw >= vx + vw - 0.5 &&
    y + rh >= vy + vh - 0.5 &&
    (near(rw, vw) || rw > vw) &&
    (near(rh, vh) || rh > vh)
  );
}

const NON_RENDERED = new Set([
  'defs', 'title', 'desc', 'metadata', 'style', 'script', 'clipPath', 'mask',
  'linearGradient', 'radialGradient', 'pattern', 'filter', 'symbol', 'marker',
]);

/** The first element that actually paints, descending into leading groups. */
function firstPaintedElement(root: Element): Element | null {
  for (const child of Array.from(root.children)) {
    if (NON_RENDERED.has(child.localName)) continue;
    if (child.localName === 'g' && !child.hasAttribute('transform')) {
      return firstPaintedElement(child) ?? null;
    }
    return child;
  }
  return null;
}

/**
 * Parses an SVG and gives it explicit pixel dimensions at `scale`, so it
 * rasterizes sharply instead of being drawn at its intrinsic size and stretched.
 */
export function prepareSVG(source: string, scale: number, removeBackground: boolean): PreparedSVG {
  const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
  const svg = doc.documentElement;
  if (doc.querySelector('parsererror') || svg.localName !== 'svg') {
    throw new Error('This file is not a valid SVG.');
  }
  const root = svg as unknown as SVGSVGElement;

  const viewBox = parseViewBox(root);
  let width = parseLength(root.getAttribute('width'));
  let height = parseLength(root.getAttribute('height'));

  if (viewBox) {
    const ratio = viewBox[2] / viewBox[3];
    if (width && !height) height = width / ratio;
    else if (height && !width) width = height * ratio;
    else if (!width && !height) {
      width = viewBox[2];
      height = viewBox[3];
    }
  }
  width ??= DEFAULT_SVG_SIZE.width;
  height ??= DEFAULT_SVG_SIZE.height;

  // Without a viewBox, changing width/height would crop instead of scale.
  if (!viewBox) {
    root.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  let removedBackground = false;
  if (removeBackground) {
    const first = firstPaintedElement(root);
    if (first?.localName === 'rect' && isFullCanvasRect(first, viewBox, width, height)) {
      first.remove();
      removedBackground = true;
    }
    if (root.style.background || root.style.backgroundColor) {
      root.style.removeProperty('background');
      root.style.removeProperty('background-color');
      removedBackground = true;
    }
  }

  root.setAttribute('width', String(width * scale));
  root.setAttribute('height', String(height * scale));

  return {
    markup: new XMLSerializer().serializeToString(doc),
    width: width * scale,
    height: height * scale,
    removedBackground,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The browser could not render this image.'));
    img.src = src;
  });
}

function fitCanvas(width: number, height: number): { width: number; height: number; clamped: boolean } {
  let factor = Math.min(1, MAX_CANVAS_SIDE / width, MAX_CANVAS_SIDE / height);
  if (width * height * factor * factor > MAX_CANVAS_AREA) {
    factor = Math.sqrt(MAX_CANVAS_AREA / (width * height));
  }
  return {
    width: Math.max(1, Math.floor(width * factor)),
    height: Math.max(1, Math.floor(height * factor)),
    clamped: factor < 1,
  };
}

async function rasterize(src: string, width: number, height: number): Promise<RasterResult> {
  const img = await loadImage(src);
  const size = fitCanvas(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context not available');
  ctx.drawImage(img, 0, 0, size.width, size.height);
  return { imageData: ctx.getImageData(0, 0, size.width, size.height), clamped: size.clamped };
}

export async function rasterizeSVG(prepared: PreparedSVG): Promise<RasterResult> {
  const url = URL.createObjectURL(new Blob([prepared.markup], { type: 'image/svg+xml' }));
  try {
    return await rasterize(url, prepared.width, prepared.height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Raster images are drawn at their natural size; upscaling them adds nothing. */
export async function rasterizeImageFile(file: File): Promise<RasterResult> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return await rasterize(url, img.naturalWidth, img.naturalHeight);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function pixelAt(data: ImageData, x: number, y: number): RGB & { a: number } {
  const i = (y * data.width + x) * 4;
  return { r: data.data[i], g: data.data[i + 1], b: data.data[i + 2], a: data.data[i + 3] };
}

/**
 * The most common opaque color among the four corners, which is nearly always
 * the background. Null when the corners are already transparent.
 */
export function detectBackgroundColor(data: ImageData): RGB | null {
  const { width: w, height: h } = data;
  const corners = [pixelAt(data, 0, 0), pixelAt(data, w - 1, 0), pixelAt(data, 0, h - 1), pixelAt(data, w - 1, h - 1)]
    .filter(p => p.a > 0);
  if (corners.length === 0) return null;

  let best = corners[0];
  let bestCount = 0;
  for (const c of corners) {
    const count = corners.filter(o => colorDistance(o, c) < 0.02).length;
    if (count > bestCount) {
      best = c;
      bestCount = count;
    }
  }
  return { r: best.r, g: best.g, b: best.b };
}

/** Euclidean RGB distance, normalized to 0..1. */
function colorDistance(a: RGB, b: RGB): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db) / 441.673;
}

export type RemovalMode = 'edges' | 'all';

export interface RemovalOptions {
  color: RGB;
  /** 0..1, how far a color can be from `color` and still be removed. */
  tolerance: number;
  /** 0..1, a band past the tolerance that fades out instead of cutting hard. */
  feather: number;
  /** `edges` only removes background connected to the border; `all` removes every match. */
  mode: RemovalMode;
}

/**
 * Removes a solid background by color. Partially removed pixels have the
 * background color un-blended out of them, so anti-aliased edges don't keep a
 * halo of the old background.
 */
export function removeBackground(source: ImageData, options: RemovalOptions): ImageData {
  const { width: w, height: h } = source;
  const out = new ImageData(new Uint8ClampedArray(source.data), w, h);
  const px = out.data;
  const { color, tolerance, feather, mode } = options;
  const total = w * h;

  const distances = new Float32Array(total);
  for (let p = 0; p < total; p++) {
    const i = p * 4;
    distances[p] = px[i + 3] === 0
      ? 0
      : colorDistance({ r: px[i], g: px[i + 1], b: px[i + 2] }, color);
  }

  const removed = new Uint8Array(total);
  if (mode === 'all') {
    for (let p = 0; p < total; p++) {
      if (distances[p] <= tolerance) removed[p] = 1;
    }
  } else {
    const stack = new Int32Array(total);
    let top = 0;
    const seed = (p: number) => {
      if (!removed[p] && distances[p] <= tolerance) {
        removed[p] = 1;
        stack[top++] = p;
      }
    };
    for (let x = 0; x < w; x++) {
      seed(x);
      seed((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      seed(y * w);
      seed(y * w + w - 1);
    }
    while (top > 0) {
      const p = stack[--top];
      const x = p % w;
      if (x > 0) seed(p - 1);
      if (x < w - 1) seed(p + 1);
      if (p >= w) seed(p - w);
      if (p < total - w) seed(p + w);
    }
  }

  const touchesRemoved = (p: number) => {
    const x = p % w;
    return (
      (x > 0 && removed[p - 1] === 1) ||
      (x < w - 1 && removed[p + 1] === 1) ||
      (p >= w && removed[p - w] === 1) ||
      (p < total - w && removed[p + w] === 1)
    );
  };

  for (let p = 0; p < total; p++) {
    const i = p * 4;
    if (removed[p]) {
      px[i + 3] = 0;
      continue;
    }
    if (feather <= 0) continue;
    const d = distances[p];
    if (d >= tolerance + feather) continue;
    // In edge mode, only soften the outline of the removed region; similar
    // colors inside the artwork are meant to stay.
    if (mode === 'edges' && !touchesRemoved(p)) continue;

    const keep = (d - tolerance) / feather;
    if (keep <= 0) {
      px[i + 3] = 0;
      continue;
    }
    for (let c = 0; c < 3; c++) {
      const bg = c === 0 ? color.r : c === 1 ? color.g : color.b;
      px[i + c] = (px[i + c] - (1 - keep) * bg) / keep;
    }
    px[i + 3] = px[i + 3] * keep;
  }

  return out;
}

export function imageDataToPNG(data: ImageData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = data.width;
  canvas.height = data.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas context not available'));
  ctx.putImageData(data, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Could not encode PNG.'))),
      'image/png'
    );
  });
}

export function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
