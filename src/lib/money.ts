/** Montants stockés en centimes (entiers) pour éviter les erreurs d'arrondi. */

export const toCents = (input: unknown): number => {
  const s = String(input ?? '')
    .replace(/[\s  ]/g, '')
    .replace(/mad|dh/gi, '')
    .replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

export const fromCents = (c: number) => (c / 100).toFixed(2);

/** "2 290,00 MAD" */
export const mad = (cents: number, withCurrency = true) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(cents / 100)
    .replace(/ | /g, ' ') + (withCurrency ? ' MAD' : '');

/** "2 290 MAD" (sans décimales, pour les tableaux de bord) */
export const madShort = (cents: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(cents / 100)).replace(/ | /g, ' ') +
  ' MAD';

// ---------- Montant en toutes lettres (usage marocain sur devis et factures) ----------
const UNITS = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf',
];
const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

function below100(n: number): string {
  if (n < 20) return UNITS[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (t === 7 || t === 9) {
    if (t === 7 && u === 1) return 'soixante et onze';
    return `${TENS[t]}-${UNITS[10 + u]}`;
  }
  if (u === 0) return t === 8 ? 'quatre-vingts' : TENS[t];
  if (u === 1 && t !== 8) return `${TENS[t]} et un`;
  return `${TENS[t]}-${UNITS[u]}`;
}

function below1000(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let s = '';
  if (h > 0) s = h === 1 ? 'cent' : `${UNITS[h]} cent${r === 0 ? 's' : ''}`;
  if (r > 0) s += (s ? ' ' : '') + below100(r);
  return s;
}

export function numberToWordsFr(n: number): string {
  n = Math.floor(Math.abs(n));
  if (n === 0) return 'zéro';
  const parts: string[] = [];
  const billions = Math.floor(n / 1e9);
  const millions = Math.floor((n % 1e9) / 1e6);
  const thousands = Math.floor((n % 1e6) / 1000);
  const rest = n % 1000;
  if (billions) parts.push(`${below1000(billions)} milliard${billions > 1 ? 's' : ''}`);
  if (millions) parts.push(`${below1000(millions)} million${millions > 1 ? 's' : ''}`);
  // "cent" et "vingt" restent invariables devant "mille"
  if (thousands) parts.push(thousands === 1 ? 'mille' : `${below1000(thousands).replace(/(cent|vingt)s$/, '$1')} mille`);
  if (rest) parts.push(below1000(rest));
  return parts.join(' ');
}

/** "deux mille deux cent quatre-vingt-dix dirhams et cinquante centimes" */
export function amountInWords(cents: number): string {
  const dh = Math.floor(cents / 100);
  const c = cents % 100;
  let s = `${numberToWordsFr(dh)} dirham${dh > 1 ? 's' : ''}`;
  if (c) s += ` et ${below100(c)} centime${c > 1 ? 's' : ''}`;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------- Dates ----------
const TZ = 'Africa/Casablanca';

/** Convertit une date SQLite UTC "YYYY-MM-DD HH:MM:SS" en Date */
export const sqlDate = (s: string) => new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z');

export const fmtDate = (s: string | null | undefined) => {
  if (!s) return '—';
  const d = s.length === 10 ? new Date(s + 'T12:00:00Z') : sqlDate(s);
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TZ }).format(d);
};

export const fmtDateTime = (s: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(
    sqlDate(s),
  );

/** Date du jour au format YYYY-MM-DD, fuseau Maroc */
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());

export const addDays = (ymd: string, days: number) => {
  const d = new Date(ymd + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
