import type { APIRoute } from 'astro';
import { createClient, hitRateLimit } from '../../lib/db';
import { LEAD_MAX_PER_HOUR } from '../../lib/auth';
import { services } from '../../config/admin';

export const prerender = false;

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

/** Formulaire de contact du site → nouveau client dans l'espace admin. */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json(415, { ok: false });
  if (Number(request.headers.get('content-length') ?? 0) > 20_000) return json(413, { ok: false });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Requête invalide.' });
  }

  // Champ piège : invisible pour les humains, rempli par les robots
  if (clean(body.website, 200)) return json(200, { ok: true });
  if ((await hitRateLimit(`lead:${clientAddress}`, 60 * 60_000)) > LEAD_MAX_PER_HOUR)
    return json(429, { ok: false, error: 'Trop de demandes, réessayez plus tard.' });

  const name = clean(body.nom, 160);
  const phone = clean(body.telephone, 40);
  if (name.length < 2 || phone.replace(/\D/g, '').length < 8) {
    return json(422, { ok: false, error: 'Nom et téléphone obligatoires.' });
  }
  if (!body.consent) return json(422, { ok: false, error: 'Consentement requis.' });

  const service = clean(body.service, 80);
  const message = clean(body.message, 3000);
  await createClient(
    {
      name,
      phone,
      email: clean(body.email, 160) || null,
      city: clean(body.ville, 80) || null,
      service: services.some((s) => s.label === service) ? service : 'Autre question',
      source: 'Site web',
      status: 'nouveau',
      notes: message || null,
    },
    `Demande reçue via le formulaire du site${message ? ` :\n${message}` : ''}`,
  );
  return json(200, { ok: true });
};
