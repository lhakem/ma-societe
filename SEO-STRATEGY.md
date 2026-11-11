# SEO strategy: masociete.ma

*Prepared 11 November 2026. Market: Morocco, French-language search.*

> **Data caveat:** live keyword volumes could not be pulled (the DataForSEO API returned 401, so the credentials need renewing). The keyword targets below come from the competitor analysis and the common French search terms for company creation in Morocco. Validate them in Google Search Console once the site has three to four weeks of data.

---

## 1. Competitor analysis

| | **audinex.ma** | **chamss.ma** | **masociete.ma** (new) |
|---|---|---|---|
| Positioning | Audit and accounting firm for established companies, Casablanca | Company-creation packs, Casablanca business center | Company creation + domiciliation + accounting, online, all of Morocco |
| Prices shown | None | 3 packs: 2,499 / 2,999 / 7,500 MAD | 3 packs + full à la carte grid + simulator |
| Site structure | ~15 template pages, long text blocks | Single page (anchors only) | 27 pages: 7 services, 6 cities, 5 guides, pricing, FAQ |
| Blog / guides | None | None | 5 in-depth guides + calendar below |
| FAQ | None | 6 questions | Per page + dedicated FAQ page (FAQPage schema) |
| Structured data | Not detected | Not detected | Organization, ProfessionalService, Service, FAQPage, Article, BreadcrumbList |
| Contact | 2 different phone numbers | WhatsApp only, no address | Phone + WhatsApp + form + address (NAP consistent) |
| Weaknesses to exploit | No prices, no creation offer, no FAQ | Contradictory claims ("1000+" vs "centaines"), no inner pages, nothing to rank beyond the brand | |

**Where we win:** Chamss can only rank its homepage, while we have a page for every intent (SARL, SARL AU, auto-entrepreneur, domiciliation, accounting, each city). Audinex doesn't target creation at all. Neither has informational content, so the "how to" searches are open.

---

## 2. Keyword map (one main keyword per page, no cannibalisation)

| Page | Main keyword | Secondary keywords | Intent |
|---|---|---|---|
| `/` | création société maroc | création entreprise maroc, créer société en ligne maroc | Commercial |
| `/creation-sarl-au-maroc/` | création sarl au maroc | sarl au, société à associé unique | Commercial |
| `/creation-sarl-maroc/` | création sarl maroc | créer une sarl, statuts sarl maroc | Commercial |
| `/auto-entrepreneur-maroc/` | auto entrepreneur maroc | statut auto-entrepreneur, inscription auto-entrepreneur | Commercial / info |
| `/creation-societe-maroc-etranger/` | créer société maroc étranger | société maroc MRE, investir au maroc | Commercial |
| `/domiciliation-entreprise-maroc/` | domiciliation casablanca | domiciliation entreprise maroc, siège social casablanca | Commercial |
| `/comptabilite-entreprise-maroc/` | comptabilité sarl maroc | comptable casablanca, fiduciaire en ligne | Commercial |
| `/modification-societe-maroc/` | transfert siège social maroc | cession parts sarl, dissolution société maroc | Commercial |
| `/tarifs/` | prix création société maroc | coût création sarl maroc, tarif domiciliation | Transactional |
| `/creation-societe-{ville}/` ×6 | création société {ville} | création sarl {ville} | Local commercial |
| `/guides/comment-creer-une-societe-au-maroc/` | comment créer une société au maroc | étapes création société maroc | Informational (pillar) |
| `/guides/sarl-ou-sarl-au/` | sarl ou sarl au | différence sarl sarl au | Informational |
| `/guides/auto-entrepreneur-ou-societe/` | auto entrepreneur ou sarl | retenue 30% auto entrepreneur | Informational |
| `/guides/documents-creation-societe-maroc/` | documents création société maroc | pièces à fournir sarl | Informational |
| `/guides/certificat-negatif-maroc/` | certificat négatif maroc | certificat négatif ompic | Informational |

**Internal linking (already built in):** guides → service pages (contextual links + CTA block); service pages ↔ each other (“Nos autres services” grid); cities ↔ cities + services; breadcrumbs on all inner pages; footer links to every service and city.

---

## 3. What's already done on the site

- Static HTML, about 15 KB gzipped homepage, LCP 0.8–1.1 s and CLS 0 in local Lighthouse (mobile); SEO 100 and Best Practices 100
- Unique title (≤ 61 characters) and meta description (140–165 characters) on every page; one H1 per page; canonical URLs; trailing-slash consistency
- JSON-LD `@graph`: Organization, WebSite, ProfessionalService (address, geo, hours, areaServed, offer catalog), Service + Offer, FAQPage, Article, BreadcrumbList, ItemList
- `sitemap-index.xml`, `robots.txt` (AI crawlers allowed for ChatGPT, Perplexity and Copilot visibility), `llms.txt`
- Open Graph and Twitter cards with a 1200×630 share image
- Accessibility: skip link, focus styles, AA contrast, keyboard-usable menus, `prefers-reduced-motion`
- Conversion: sticky call + WhatsApp bar on mobile, price simulator that pre-fills a WhatsApp quote, pack suggestions

---

## 4. Content calendar (2 guides per month)

| Month | Guide | Targets | Links to |
|---|---|---|---|
| M1 | Coût réel de création d’une SARL au Maroc (frais d’État détaillés) | prix création sarl maroc | /tarifs/ |
| M1 | Statuts de SARL : les clauses à ne pas oublier | statuts sarl maroc | /creation-sarl-maroc/ |
| M2 | Ouvrir un compte bancaire professionnel au Maroc | compte bancaire société maroc | /creation-sarl-au-maroc/ |
| M2 | ICE, IF, RC, TP : à quoi sert chaque numéro | ice maroc, identifiant fiscal | pillar guide |
| M3 | TVA au Maroc pour une jeune société : régime, taux, déclarations | déclaration tva maroc | /comptabilite-entreprise-maroc/ |
| M3 | Domiciliation chez soi : est-ce possible ? | domicilier société chez soi maroc | /domiciliation-entreprise-maroc/ |
| M4 | Rémunération du gérant de SARL : salaire ou dividendes | salaire gérant sarl maroc | /comptabilite-entreprise-maroc/ |
| M4 | Créer une SAS au Maroc : quand est-ce pertinent ? | sas maroc | /creation-sarl-maroc/ (or a new SAS page) |
| M5 | Fermer une SARL : dissolution et liquidation pas à pas | dissolution sarl maroc | /modification-societe-maroc/ |
| M5 | Céder ses parts de SARL : procédure et fiscalité | cession parts sociales maroc | /modification-societe-maroc/ |
| M6 | Créer une société d’import-export au Maroc | société import export maroc | /creation-societe-tanger/ |
| M6 | Calendrier fiscal annuel de la PME marocaine | échéances fiscales maroc | /comptabilite-entreprise-maroc/ |

Each guide: 900–1,500 words, a named expert author, an update date, 3+ internal links, and a clear CTA. **Re-check tax figures after each Finance Law (January).**

---

## 5. Roadmap

### Phase 1: Launch (weeks 1–4)
- Fill every `TODO` in `src/config/site.ts`; validate prices and promises
- Deploy on a CDN host; force HTTPS; one canonical domain
- Google Search Console + Bing Webmaster Tools; submit the sitemap
- **Google Business Profile** in Casablanca: category “Service de création d’entreprise”, same NAP as the site, WhatsApp linked, hours, photos of the office and team
- Real team photos and bios on `/a-propos/` (E-E-A-T)

### Phase 2: Expansion (weeks 5–12)
- Collect the first Google reviews (ask every client at RC delivery); then add real testimonials in `site.ts`
- Directory citations with identical NAP: Kerix, Charika.ma, Telecontact, Maroc Annuaire, Yellow pages, Facebook, LinkedIn page
- Publish 4 guides from the calendar
- Track WhatsApp clicks and form submissions as conversions (GA4 or Plausible, with consent where required)

### Phase 3: Scale (months 4–6)
- **Arabic version** (`/ar/`, RTL, with `hreflang` fr-MA / ar-MA). Neither competitor has one, so this is a clear gap
- New city pages only with unique local content: Meknès, Oujda, Kénitra, Tétouan, El Jadida
- Dedicated SAS page if search data confirms demand
- Partnerships for links: incubators, coworkings, banks' SME programmes, Moroccan diaspora associations (MRE)

### Phase 4: Authority (months 7–12)
- An original data piece (e.g., “Baromètre de la création d’entreprise au Maroc”) to earn press links
- Guest expert content on business media; podcast or YouTube explainers embedded in guides
- Quarterly refresh of all guides; monitor AI citations (ChatGPT, Perplexity) for the core queries

---

## 6. KPIs

| Metric | Launch | 3 months | 6 months | 12 months |
|---|---|---|---|---|
| Indexed pages | 26 | 32 | 40 | 55+ |
| Top-10 keywords (GSC) | 0 | 15 | 40 | 100 |
| Organic clicks / month | 0 | 300 | 1,200 | 4,000 |
| Google reviews | 0 | 15 | 40 | 100 |
| Leads (WhatsApp + form) / month | – | 30 | 90 | 250 |
| Core Web Vitals (field) | – | All green | All green | All green |

These targets are estimates for planning. Replace them with real baselines once Search Console has data.
