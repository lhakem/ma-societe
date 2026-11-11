import type { APIRoute } from 'astro';
import { exportDocuments } from '../../lib/db';
import { statusOf } from '../../config/admin';
import { today } from '../../lib/money';

export const prerender = false;

const cell = (v: unknown) => {
  const s = String(v ?? '');
  // protège contre l'injection de formules dans Excel
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[";\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};
const num = (cents: number) => (cents / 100).toFixed(2).replace('.', ',');

/** Export CSV (séparateur « ; », compatible Excel FR) des devis ou factures. */
export const GET: APIRoute = async ({ url }) => {
  const type = url.searchParams.get('type') === 'devis' ? 'devis' : 'facture';
  const rows = await exportDocuments(type);

  const header = ['Numéro', 'Date', 'Échéance', 'Client', 'Société', 'ICE client', 'Objet', 'Total HT', 'TVA', 'Total TTC', 'Payé', 'Statut'];
  const lines = rows.map((d) =>
    [
      d.number, d.issue_date, d.due_date, d.client_name, d.client_company, d.client_ice, d.subject,
      num(d.total_ht), num(d.total_tva), num(d.total_ttc), num(d.paid), statusOf(type, d.status).label,
    ].map(cell).join(';'),
  );
  const csv = '﻿' + [header.join(';'), ...lines].join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${type === 'devis' ? 'devis' : 'factures'}-${today()}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
};
