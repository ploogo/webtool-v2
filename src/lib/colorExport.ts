import { ColorShade } from './colorUtils';

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
        String((index + 1) * 100 - (index === 0 ? 50 : 0)),
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
          String((index + 1) * 100 - (index === 0 ? 50 : 0)),
          shade.hex,
        ])
      ),
    }), {}),
    ...Object.entries(colorData.supporting).reduce((acc, [key, value]) => ({
      ...acc,
      [key.toLowerCase()]: Object.fromEntries(
        value.shades.map((shade, index) => [
          String((index + 1) * 100 - (index === 0 ? 50 : 0)),
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
      `  --${prefix}-${(index + 1) * 100 - (index === 0 ? 50 : 0)}: ${shade.hex};`
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
      `  --${prefix}-${(index + 1) * 100 - (index === 0 ? 50 : 0)}: ${shade.hex};`
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
      `  --${prefix}-${(index + 1) * 100 - (index === 0 ? 50 : 0)}: ${shade.hex};`
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
      `$${prefix}-${(index + 1) * 100 - (index === 0 ? 50 : 0)}: ${shade.hex};`
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
      `$${prefix}-${(index + 1) * 100 - (index === 0 ? 50 : 0)}: ${shade.hex};`
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
      `$${prefix}-${(index + 1) * 100 - (index === 0 ? 50 : 0)}: ${shade.hex};`
  )
  .join('\n')}`;
    })
    .join('\n\n');

  return `${mainPalettes}

// Supporting Colors
${supportingPalettes}`;
}

export function generateJSON(title: string, { baseColor, shades }: ColorExport) {
  return JSON.stringify(
    {
      base: baseColor,
      shades: Object.fromEntries(
        shades.map((shade, index) => [
          String((index + 1) * 100 - (index === 0 ? 50 : 0)),
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