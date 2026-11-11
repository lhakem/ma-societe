// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://masociete.ma',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,

  // Cloudflare Workers : le site public est pré-rendu (fichiers statiques),
  // seuls /admin et /api s'exécutent dans le Worker, avec la base D1.
  adapter: cloudflare({
    imageService: 'passthrough', // pas d'images optimisées à la volée : aucun service payant requis
  }),
  session: false, // sessions Astro inutiles (l'admin a son propre cookie signé) : pas de KV

  // Secrets lus à l'exécution (Cloudflare : Settings > Variables and Secrets ; en local : fichier .env)
  env: {
    schema: {
      ADMIN_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
      SESSION_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/admin') && !page.includes('/api/'),
      changefreq: 'weekly',
      lastmod: new Date(),
    }),
  ],
});
