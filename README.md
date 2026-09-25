# Flonam

Corporate website voor Flonam, ontwerp "Console". Gebouwd met **Hugo Extended**, één stylesheet en een paar kleine vanilla-JS-modules. Er is geen Node-buildstap.

## Lokaal draaien

Vereisten: Hugo Extended v0.164.0 of nieuwer (`winget install Hugo.Hugo.Extended` of `brew install hugo`).

```bash
hugo server
```

De site draait op http://localhost:1313.

## Build

```bash
hugo --gc --minify
```

De output komt in `public/`.

## Mappenstructuur

```
content/nl/, content/en/    Paginacopy (front matter + markdown)
data/producten/<taal>.yaml  Producten: kaarten, productpagina, footer, ⌘K-palet
data/principles/<taal>.yaml Uitgangspunten-strook (Home en Over ons)
data/metrics.yaml           Meetwaarden (uptime, P95, EAA-percentages …). Leeg = niet tonen
i18n/nl.toml, i18n/en.toml  UI-strings
layouts/                    baseof, home, producten, over, contact, page (+ _partials/)
layouts/home.searchindex.json  Zoekindex voor het ⌘K-palet (/search.json, /en/search.json)
assets/css/site.css         Het enige stylesheet; design tokens staan bovenaan als CSS-variabelen
assets/js/                  main.js bundelt terminal, gitlog, palette, copy en form
static/fonts/               Archivo en JetBrains Mono, zelf gehost
static/images/              Logo, screenshots en teamfoto's
```

## Contactformulier

Het formulier post naar [Formspree](https://formspree.io). Maak daar een formulier aan en zet de endpoint in `hugo.toml`:

```toml
[params.contact]
  formEndpoint = "https://formspree.io/f/xxxxxxxx"
```

Zolang `formEndpoint` leeg is, opent het formulier het mailprogramma van de bezoeker, met alles al ingevuld.

## Meetwaarden

De cijfers uit het ontwerp (uptime, P95, gemiddelde tijd, deploy-tijd, voortgang van product-03 en de EAA-percentages per sector) staan in `data/metrics.yaml`. Ze zijn nu allemaal leeg. Vul een waarde pas in als die echt gemeten is. Lege waarden worden weggelaten.

## Toegankelijkheid

De site moet voldoen aan WCAG 2.2 AA. Controleer na wijzigingen met axe of pa11y op 375, 768 en 1280 px, en test ook met `prefers-reduced-motion: reduce`.

## Deploy

Een push naar `main` start de GitHub Actions-workflow. Die bouwt de site en publiceert naar GitHub Pages (zie `.github/workflows/deploy.yml`).
