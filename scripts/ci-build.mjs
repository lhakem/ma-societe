// Cloudflare Workers Builds : si aucune « Build command » n'est renseignée dans le tableau de bord,
// Cloudflare installe les paquets puis lance directement « npx wrangler deploy » sans construire le site.
// Ce script (lancé après « npm install ») construit le site, UNIQUEMENT sur les machines de build (CI).
// En local, il ne fait rien.
import { execSync } from 'node:child_process';

if (process.env.WORKERS_CI || process.env.CI) {
  console.log('[ci-build] Build du site avant le déploiement Cloudflare…');
  execSync('npm run build', { stdio: 'inherit' });
}
