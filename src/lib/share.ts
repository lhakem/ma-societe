/** Liens de suivi client et WhatsApp. */

export const trackingUrl = (origin: string, token: string) => new URL(`/suivi/${token}/`, origin).href;
export const trackingDocUrl = (origin: string, token: string, docId: number) =>
  new URL(`/suivi/${token}/document/${docId}/`, origin).href;

/** Numéro marocain → format WhatsApp international (0661… → 212661…). Vide si invalide. */
export function waNumber(phone: string | null | undefined) {
  let d = (phone ?? '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 10 && d.startsWith('0')) d = '212' + d.slice(1);
  return d.length >= 11 ? d : '';
}

export const waLink = (phone: string | null | undefined, text: string) => {
  const n = waNumber(phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
};
