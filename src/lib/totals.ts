/** Calcul des totaux d'un devis / d'une facture. Sans dépendance : utilisé côté serveur ET navigateur. */
export interface LineInput {
  qty: number;
  unit_price: number; // centimes HT
  vat_rate: number; // %
}

export function lineTotal(l: LineInput) {
  return Math.round((Number(l.qty) || 0) * (Number(l.unit_price) || 0));
}

export function computeTotals(lines: LineInput[]) {
  const byRate = new Map<number, number>();
  let ht = 0;
  for (const l of lines) {
    const t = lineTotal(l);
    ht += t;
    byRate.set(l.vat_rate, (byRate.get(l.vat_rate) ?? 0) + t);
  }
  const vat = [...byRate.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([rate, base]) => ({ rate, base, amount: Math.round((base * rate) / 100) }));
  const tva = vat.reduce((s, v) => s + v.amount, 0);
  return { ht, tva, ttc: ht + tva, vat };
}
