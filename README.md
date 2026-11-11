# masociete.ma — website

Static site built with [Astro](https://astro.build). Every page is pre-rendered HTML: fast, SEO-friendly, and hostable anywhere.

## Run it

```bash
npm install        # first time only
npm run dev        # http://localhost:4321 with live reload
npm run build      # production build in dist/
npm run preview    # serve dist/ locally
```

## Where to edit things

| What | File |
|---|---|
| Phone, WhatsApp, e-mail, address, hours, delays, legal IDs | `src/config/site.ts` (top block) |
| **All prices**: creation, domiciliation, accounting, packs | `src/config/site.ts` (`catalog`, `packs`) |
| Customer reviews (section hidden while empty) | `src/config/site.ts` (`testimonials`) |
| City pages (content, districts, sectors) | `src/config/cities.ts` |
| Menu links | `src/config/nav.ts` |
| Colours, fonts, spacing | `src/styles/global.css` (`:root` tokens) |
| Service page texts | `src/pages/*.astro` |
| Guides / blog | `src/content/guides/*.md` |
| Social share image, favicon, logo PNG | `scripts/generate-images.mjs`, then `npm run images` |

Prices, packs and the simulator all read from the same `catalog`, so changing a price once updates every page, the simulator, and the structured data.

### Add a guide
Create `src/content/guides/my-slug.md`:

```md
---
title: "Full title shown on the page"
metaTitle: "Shorter title for Google (≤ 50 chars)"
description: "Meta description, 140–160 characters."
published: 2026-12-01
category: "Création"          # Création | Fiscalité | Juridique | Gestion
readingTime: 6
related: ["sarl-ou-sarl-au"]  # slugs of other guides
---

Article in Markdown. Use ## for sections (they build the table of contents).
```

### Add a city
Add an entry to `src/config/cities.ts`. Only add a city if you can write **genuinely local** content for it (court, CRI, districts, sectors); near-duplicate city pages hurt SEO.

## Before going live — checklist

Everything marked `TODO` must be replaced with real information:

- [ ] `src/config/site.ts`: phone, WhatsApp number, address, postal code, GPS coordinates, legal name, RC / ICE / IF / TP, host
- [ ] **Validate every price and promise** (`delai`, `responseTime`, `priceNote` "frais administratifs inclus", pack contents). These are proposals positioned against competitors, not your real prices
- [ ] Add a form endpoint (`formEndpoint`, e.g. Formspree / Web3Forms) or keep the WhatsApp fallback
- [ ] Guide author: a named person with credentials (expert-comptable, juriste) rather than "Équipe juridique"
- [ ] About page: team names and photos (see the TODO comment in `src/pages/a-propos.astro`)
- [ ] Privacy policy: add your CNDP declaration number (law 09-08)
- [ ] Have a legal professional proofread the guides (tax rules change every Finance Law)
- [ ] Only add **real** testimonials

## Deploy

`npm run build` produces a fully static `dist/` folder. Options:

- **Cloudflare Pages / Netlify / Vercel** (recommended, free, global CDN): connect the Git repo, build command `npm run build`, output `dist`.
- **Classic Moroccan hosting (cPanel)**: upload the contents of `dist/` to `public_html/`.

Then point the `masociete.ma` DNS records to the host, and force HTTPS and a single version of the domain (with or without `www`, matching `site` in `astro.config.mjs`).

## After launch (SEO)

1. Google Search Console: add the domain and submit `https://masociete.ma/sitemap-index.xml`
2. Bing Webmaster Tools: import from Search Console (Bing powers Copilot and ChatGPT search)
3. Google Business Profile with the **exact same** name, address and phone as the site
4. See `SEO-STRATEGY.md` for the content plan and roadmap
