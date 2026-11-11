import { catalog, packs, formatMAD, type CreationForm, type ExtraId } from '../config/site';

export interface Selection {
  form: CreationForm;
  dom: number; // mois de domiciliation (0 = aucune)
  compta: number; // mois de comptabilité (0 = aucune)
  extras: ExtraId[];
}

export interface Estimate {
  lines: { label: string; price: number }[];
  total: number;
  pack?: { name: string; price: number; saving: number };
}

export const SARL_SURCHARGE = 300;

export function comptaPrice(form: CreationForm, months: number): number {
  if (!months) return 0;
  const table = form === 'ae' ? catalog.comptabiliteAE : catalog.comptabilite;
  return table[months] ?? 0;
}

export function estimate(sel: Selection): Estimate {
  const lines: Estimate['lines'] = [];
  const f = catalog.creation[sel.form];
  lines.push({ label: `Création ${f.short}`, price: f.price });

  const dom = sel.form === 'ae' ? 0 : sel.dom;
  if (dom) lines.push({ label: `Domiciliation ${dom} mois`, price: catalog.domiciliation[dom] ?? 0 });
  if (sel.compta)
    lines.push({
      label: sel.form === 'ae' ? `Déclarations ${sel.compta} mois` : `Comptabilité ${sel.compta} mois`,
      price: comptaPrice(sel.form, sel.compta),
    });
  for (const e of sel.extras) lines.push({ label: catalog.extras[e].label, price: catalog.extras[e].price });

  const total = lines.reduce((s, l) => s + l.price, 0);

  // Le pack le moins cher qui couvre la sélection, s'il est plus avantageux
  let pack: Estimate['pack'];
  if (sel.form === 'sarl-au' || sel.form === 'sarl') {
    const sorted = [...packs].sort((a, b) => a.price - b.price);
    for (const p of sorted) {
      const covers =
        dom <= p.domiciliation && sel.compta <= p.comptabilite && sel.extras.every((e) => p.extras.includes(e));
      const price = p.price + (sel.form === 'sarl' ? SARL_SURCHARGE : 0);
      if (covers && price < total) {
        pack = { name: p.name, price, saving: total - price };
        break;
      }
    }
  }
  return { lines, total, pack };
}

export { formatMAD };
