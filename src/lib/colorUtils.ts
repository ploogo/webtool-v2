import { hslToHex, hexToHSL } from './colorConversion';

export interface ColorShade {
  hex: string;
  hsl: string;
}

export function generateShades(baseColor: string): ColorShade[] {
  const { h, s } = hexToHSL(baseColor);
  
  // Generate 10 shades with varying lightness
  const shades: ColorShade[] = [];
  const numShades = 10;
  
  for (let i = 0; i < numShades; i++) {
    const lightness = 95 - (i * 8); // From light to dark
    const hex = hslToHex(h, s, lightness);
    const hsl = `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(lightness)}%)`;
    shades.push({ hex, hsl });
  }
  
  return shades;
}