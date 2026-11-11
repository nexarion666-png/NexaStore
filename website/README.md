# NexaStore website

The NexaStore website is built with React, TypeScript, and Vite.

## Run locally

You need Node.js 20 or newer.

```bash
cd website
npm install
npm run dev
```

Vite prints the local development URL after startup.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `website/dist`.

## Current catalogue

The first listing is Nexvio. Its APK download points to the latest GitHub Release in the Nexvio repository. The catalogue is currently defined in `src/App.tsx`; a shared backend catalogue will replace this as the project grows.

## Deployment

For Vercel, import this repository and set the project root directory to `website`. Use:

- Build command: `npm run build`
- Output directory: `dist`

No environment variables are required for this initial website.
