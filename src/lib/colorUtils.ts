import { hslToHex, hexToHSL } from './colorConversion';

/** The Tailwind shade scale, in the order generateShades() emits them. */
export const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export interface ColorShade {
  hex: string;
  hsl: string;
}

/** Builds a shade (hex plus matching HSL label) from a hex colour. */
export function toShade(hex: string): ColorShade {
  const { h, s, l } = hexToHSL(hex);
  return {
    hex: hex.toUpperCase(),
    hsl: `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`,
  };
}

export function generateShades(baseColor: string): ColorShade[] {
  const { h, s } = hexToHSL(baseColor);
  
  // One shade per step on the Tailwind scale, light to dark
  const shades: ColorShade[] = [];

  for (let i = 0; i < SHADE_STEPS.length; i++) {
    const lightness = 95 - (i * 8); // From light to dark
    const hex = hslToHex(h, s, lightness);
    const hsl = `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(lightness)}%)`;
    shades.push({ hex, hsl });
  }
  
  return shades;
}