import type { ClientInput, Line } from './db';
import { clientStatuses } from '../config/admin';
import { toCents } from './money';

const str = (fd: FormData, k: string, max = 500) => {
  const v = String(fd.get(k) ?? '').trim().slice(0, max);
  return v === '' ? null : v;
};

export function clientFromForm(fd: FormData): ClientInput {
  const status = String(fd.get('status') ?? 'nouveau');
  return {
    name: str(fd, 'name', 160) ?? '',
    company: str(fd, 'company', 160),
    ice: str(fd, 'ice', 30),
    phone: str(fd, 'phone', 40),
    email: str(fd, 'email', 160),
    city: str(fd, 'city', 80),
    address: str(fd, 'address', 300),
    service: str(fd, 'service', 80),
    source: str(fd, 'source', 60),
    status: status in clientStatuses ? status : 'nouveau',
    notes: str(fd, 'notes', 5000),
  };
}

/** Lignes du formulaire devis/facture : desc[], qty[], price[], vat[] */
export function linesFromForm(fd: FormData): Line[] {
  const desc = fd.getAll('desc').map(String);
  const qty = fd.getAll('qty').map(String);
  const price = fd.getAll('price').map(String);
  const vat = fd.getAll('vat').map(String);
  const lines: Line[] = [];
  desc.forEach((d, i) => {
    const description = d.trim().slice(0, 1000);
    if (!description) return;
    const q = Number(String(qty[i] ?? '1').replace(',', '.'));
    lines.push({
      description,
      qty: Number.isFinite(q) && q > 0 ? q : 1,
      unit_price: toCents(price[i]),
      vat_rate: Math.max(0, Math.min(100, Number(vat[i] ?? 20) || 0)),
    });
  });
  return lines.slice(0, 100);
}

export const isYmd = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
export const go = (path: string, msg?: { ok?: string; err?: string }) => {
  const u = new URLSearchParams();
  if (msg?.ok) u.set('ok', msg.ok);
  if (msg?.err) u.set('err', msg.err);
  return path + (u.size ? (path.includes('?') ? '&' : '?') + u.toString() : '');
};
