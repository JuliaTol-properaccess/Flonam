# Flonam

Corporate website voor Flonam. Gebouwd met **Hugo Extended** en **Tailwind CSS v4**.

## Lokaal draaien

Vereisten:

- Hugo Extended v0.151.0+ (`brew install hugo`)
- Node.js 20+ (`brew install node`)

```bash
npm install
npm run dev
```

De site draait op http://localhost:1313.

## Build

```bash
npm run build
```

Output staat in `public/`.

## Mappenstructuur

```
content/nl/    Nederlandse content (markdown)
layouts/       Hugo templates
assets/css/    Tailwind broncode (main.css)
static/        Statische assets (images, favicon, etc.)
config/        Optionele extra config
```

## Deploy

Push naar `main` triggert de GitHub Actions workflow die de site bouwt en naar GitHub Pages publiceert (zie `.github/workflows/deploy.yml`).
