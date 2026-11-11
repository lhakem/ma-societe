# masociete.ma: website + admin dashboard

- **Public website**: pre-rendered static pages served by Cloudflare (fast, SEO-friendly).
- **Admin dashboard** at `/admin`: client tracking (suivi client), quotes (devis) and invoices (factures). Runs in a **Cloudflare Worker** with a **Cloudflare D1** database.

## Run it locally

```bash
npm install        # first time only
npm run dev        # http://localhost:4321 with live reload (Cloudflare runtime + local D1)
npm run build      # production build in dist/
npm run preview    # serve the production build locally in the Cloudflare runtime
```

Local admin: http://localhost:4321/admin/. The credentials are in `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). The local database lives in `.wrangler/state/` and is separate from production.

## Deploy: Git → Cloudflare Workers Builds

Every push to `main` builds and deploys automatically.

**One-time setup**
1. Push this folder to your Git repository (GitHub or GitLab).
2. Cloudflare dashboard → **Workers & Pages → Create → Import a repository** → choose the repo.
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - (Non-production branches: `npx wrangler versions upload`)
3. The **D1 database `masociete` is created automatically** on the first deploy (no ID to copy).
4. Worker → **Settings → Variables and Secrets** → add 3 **secrets**: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (10+ characters), `SESSION_SECRET` (32+ random characters). Use the same values as your `.env`, or new ones.
5. Worker → **Settings → Domains & Routes** → add `masociete.ma` and `www.masociete.ma` (the domain must be on Cloudflare DNS).

Manual deploy from your computer (optional): `npm run deploy`.

### Secrets: never in Git
`.env`, `.dev.vars` and `.wrangler/` are excluded by `.gitignore`. In production the secrets exist only in Cloudflare. Changing `ADMIN_PASSWORD` logs out every open session.

## Admin dashboard

| Section | What it does |
|---|---|
| **Tableau de bord** | New contacts, files in progress, pending quotes, invoiced and collected this month, unpaid and overdue invoices, recent activity |
| **Clients** | Search and status filters (Nouveau → Devis envoyé → En cours → Terminé / Perdu). Each client: **file tracker** with steps per service, ready-made **WhatsApp progress message**, notes and calls, quotes and invoices |
| **Devis** | Line editor with one-click services from the site catalogue, **VAT 20 %** by default (per line, so government fees passed on to the client can be 0 %), live totals, sent / accepted / refused, **turn into an invoice** |
| **Factures** | Draft → **Émettre** (issue): assigns the next number F-YYYY-0001, sequential with no gaps (computed atomically in the database), and locks the invoice. Partial or full payments; status updates automatically. Issued invoices can be cancelled with a reason, never deleted |
| **Imprimer / PDF** | A4 layout: your header, client ICE, VAT by rate, amount in words, payment terms, legal footer (IF, ICE). Browser → “Enregistrer en PDF” |
| **Paramètres** | Company details on documents, default VAT, quote validity, payment terms, **full backup (JSON)**, **CSV export** of invoices and quotes for your accountant |

**Website leads arrive automatically.** The site's contact form creates a “Nouveau contact” in the dashboard (honeypot + rate limit against spam). If the dashboard can't be reached, the form falls back to WhatsApp.

**Security**: signed HttpOnly session cookie, login limited to 5 failed attempts per 15 minutes, cross-site form posts blocked, admin pages `noindex` and not cacheable.

### Backups
D1 keeps 30 days of history: **Time Travel** lets you restore the database to any minute (`npx wrangler d1 time-travel restore masociete --timestamp=...`). In addition:
- **Paramètres → Télécharger une sauvegarde** (JSON of every table)
- or `npx wrangler d1 export masociete --remote --output=backup.sql`

## Where to edit the website

| What | File |
|---|---|
| Phone, WhatsApp, e-mail, address, hours, legal IDs | `src/config/site.ts` (top block) |
| **All prices**: creation, domiciliation, accounting, packs | `src/config/site.ts` (`catalog`, `packs`) |
| Customer reviews (section hidden while empty) | `src/config/site.ts` (`testimonials`) |
| City pages | `src/config/cities.ts` |
| Admin statuses and file steps per service | `src/config/admin.ts` |
| Menu links | `src/config/nav.ts` |
| Colours, fonts, spacing | `src/styles/global.css`, `src/styles/admin.css` |
| Guides / blog | `src/content/guides/*.md` |
| Cloudflare config (Worker name, D1) | `wrangler.jsonc` |
| Social share image, favicon | `scripts/generate-images.mjs`, then `npm run images` |

Prices, packs, the simulator and the admin catalogue all read from the same `catalog`.

### Add a guide
Create `src/content/guides/my-slug.md` (copy the frontmatter of an existing guide: `title`, `metaTitle`, `description`, `published`, `category`, `readingTime`, `related`). Commit and push: it's online after the next deploy.

## Before launch

- [ ] **Validate every price and promise** (`delai`, `responseTime`, “frais administratifs inclus”, pack contents)
- [ ] Guide author: a named expert rather than “Équipe juridique”; team photos on `/a-propos/`
- [ ] Only real testimonials

## After launch (SEO)

1. Google Search Console: submit `https://masociete.ma/sitemap-index.xml`
2. Bing Webmaster Tools
3. Google Business Profile with the **exact same** name, address and phone as the site (293 Bd Abdelmoumen, 07 14 42 23 00)
4. See `SEO-STRATEGY.md`
