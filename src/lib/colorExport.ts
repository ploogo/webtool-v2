import { ColorShade, SHADE_STEPS } from './colorUtils';

/**
 * Maps a shade's position to its scale step. The previous arithmetic produced
 * 50, 200, 300 ... 1000 — skipping 100 and inventing a step Tailwind has no
 * name for.
 */
function shadeStep(index: number): number {
  return SHADE_STEPS[index] ?? (index + 1) * 100;
}

interface ColorExport {
  baseColor: string;
  shades: ColorShade[];
}

interface GlobalColorExport {
  palettes: {
    [key: string]: {
      baseColor: string;
      shades: ColorShade[];
    };
  };
  supporting: {
    [key: string]: {
      baseColor: string;
      shades: ColorShade[];
    };
  };
}

export function generateTailwindConfig(title: string, { shades }: ColorExport) {
  const config = {
    [title.toLowerCase()]: Object.fromEntries(
      shades.map((shade, index) => [
        String(shadeStep(index)),
        shade.hex,
      ])
    ),
  };

  return `module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(config, null, 2)}
    }
  }
}`;
}

export function generateGlobalTailwindConfig(colorData: GlobalColorExport) {
  const colors = {
    ...Object.entries(colorData.palettes).reduce((acc, [key, value]) => ({
      ...acc,
      [key.toLowerCase()]: Object.fromEntries(
        value.shades.map((shade, index) => [
          String(shadeStep(index)),
          shade.hex,
        ])
      ),
    }), {}),
    ...Object.entries(colorData.supporting).reduce((acc, [key, value]) => ({
      ...acc,
      [key.toLowerCase()]: Object.fromEntries(
        value.shades.map((shade, index) => [
          String(shadeStep(index)),
          shade.hex,
        ])
      ),
    }), {}),
  };

  return `module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 2)}
    }
  }
}`;
}

export function generateCSSVariables(title: string, { baseColor, shades }: ColorExport) {
  const prefix = title.toLowerCase();
  return `:root {
  --${prefix}-base: ${baseColor};
${shades
  .map(
    (shade, index) =>
      `  --${prefix}-${shadeStep(index)}: ${shade.hex};`
  )
  .join('\n')}
}`;
}

export function generateGlobalCSSVariables(colorData: GlobalColorExport) {
  const mainPalettes = Object.entries(colorData.palettes)
    .map(([key, value]) => {
      const prefix = key.toLowerCase();
      return `  /* ${key} */
  --${prefix}-base: ${value.baseColor};
${value.shades
  .map(
    (shade, index) =>
      `  --${prefix}-${shadeStep(index)}: ${shade.hex};`
  )
  .join('\n')}`;
    })
    .join('\n\n');

  const supportingPalettes = Object.entries(colorData.supporting)
    .map(([key, value]) => {
      const prefix = key.toLowerCase();
      return `  /* ${key} */
  --${prefix}-base: ${value.baseColor};
${value.shades
  .map(
    (shade, index) =>
      `  --${prefix}-${shadeStep(index)}: ${shade.hex};`
  )
  .join('\n')}`;
    })
    .join('\n\n');

  return `:root {
${mainPalettes}

  /* Supporting Colors */
${supportingPalettes}
}`;
}

export function generateSassVariables(title: string, { baseColor, shades }: ColorExport) {
  const prefix = title.toLowerCase();
  return `$${prefix}-base: ${baseColor};
${shades
  .map(
    (shade, index) =>
      `$${prefix}-${shadeStep(index)}: ${shade.hex};`
  )
  .join('\n')}`;
}

export function generateGlobalSassVariables(colorData: GlobalColorExport) {
  const mainPalettes = Object.entries(colorData.palettes)
    .map(([key, value]) => {
      const prefix = key.toLowerCase();
      return `// ${key}
$${prefix}-base: ${value.baseColor};
${value.shades
  .map(
    (shade, index) =>
      `$${prefix}-${shadeStep(index)}: ${shade.hex};`
  )
  .join('\n')}`;
    })
    .join('\n\n');

  const supportingPalettes = Object.entries(colorData.supporting)
    .map(([key, value]) => {
      const prefix = key.toLowerCase();
      return `// ${key}
$${prefix}-base: ${value.baseColor};
${value.shades
  .map(
    (shade, index) =>
      `$${prefix}-${shadeStep(index)}: ${shade.hex};`
  )
  .join('\n')}`;
    })
    .join('\n\n');

  return `${mainPalettes}

// Supporting Colors
${supportingPalettes}`;
}

export function generateJSON(_title: string, { baseColor, shades }: ColorExport) {
  return JSON.stringify(
    {
      base: baseColor,
      shades: Object.fromEntries(
        shades.map((shade, index) => [
          String(shadeStep(index)),
          {
            hex: shade.hex,
            hsl: shade.hsl,
          },
        ])
      ),
    },
    null,
    2
  );
}

export function generateGlobalJSON(colorData: GlobalColorExport) {
  return JSON.stringify(colorData, null, 2);
}