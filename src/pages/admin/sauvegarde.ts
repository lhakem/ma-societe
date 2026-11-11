import type { APIRoute } from 'astro';
import { exportAll } from '../../lib/db';
import { today } from '../../lib/money';

export const prerender = false;

/** Copie complète de la base (toutes les tables) au format JSON. */
export const GET: APIRoute = async () => {
  const data = { exported_at: new Date().toISOString(), tables: await exportAll() };
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="masociete-sauvegarde-${today()}.json"`,
      'Cache-Control': 'no-store',
    },
  });
};
