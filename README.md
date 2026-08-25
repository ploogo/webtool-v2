# webtool-v2

A personal browser-based toolbox: PDF thumbnails, image compression and cropping,
colour palettes, meta tags, schema.org markup, URL slugs, UTM links, A/B test
significance, text case conversion and symbols.

## Requirements

Node.js 22 (see `.nvmrc`). With nvm:

```bash
nvm use
```

`engine-strict` is on, so `npm install` refuses to run on anything older.

## Development

```bash
npm install
npm run dev        # start the dev server
npm run build      # typecheck (tsc -b) then build to dist/
npm run preview    # serve the production build
npm run typecheck  # types only
npm run lint
```

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/ploogo/webtool-v2)
