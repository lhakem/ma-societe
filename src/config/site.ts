/**
 * ============================================================
 *  MA SOCIÉTÉ — CONFIGURATION CENTRALE DU SITE
 * ============================================================
 *  Toutes les informations de l'entreprise, les prix et les
 *  promesses commerciales sont ici. Modifiez ce fichier, le site
 *  entier (pages, données structurées, simulateur) se met à jour.
 *
 *  ⚠️ Les valeurs marquées TODO sont des exemples à remplacer
 *  par vos vraies informations avant la mise en ligne.
 * ============================================================
 */

export const site = {
  name: 'Ma Société',
  legalName: 'ADRAOUI EL MEHDI', // raison sociale
  url: 'https://masociete.ma',
  tagline: 'Création de société au Maroc, 100 % en ligne',
  description:
    "Créez votre SARL, SARL AU ou statut d'auto-entrepreneur au Maroc sans vous déplacer. Prix fixe affiché, domiciliation et comptabilité au même endroit.",
  locale: 'fr_MA',
  lang: 'fr-MA',

  // --- Contact ---
  phoneDisplay: '07 14 42 23 00',
  phoneE164: '+212714422300',
  whatsapp: '212714422300', // numéro WhatsApp au format international, sans + ni espaces
  email: 'contact@masociete.ma',

  address: {
    street: '293 Bd Abdelmoumen, Étage 5, Apt 1',
    city: 'Casablanca',
    postalCode: '', // TODO : code postal (laisser vide pour le masquer)
    region: 'Casablanca-Settat',
    country: 'MA',
  },
  /** Coordonnées GPS exactes du bureau (clic droit sur Google Maps). null = non affichées. */
  geo: null as { lat: number; lng: number } | null,
  hours: [
    { days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '09:00', closes: '18:30', label: 'Lundi – Vendredi : 9h00 – 18h30' },
    { days: ['Sa'], opens: '09:30', closes: '13:00', label: 'Samedi : 9h30 – 13h00' },
  ],

  // --- Promesses commerciales (à valider) ---
  delai: '7 à 10 jours ouvrés', // délai moyen d'immatriculation après dossier complet
  responseTime: 'moins de 2 heures', // délai de réponse en jours ouvrés
  priceNote: 'Prix HT · frais administratifs inclus', // TODO : vérifier que vos prix incluent bien les frais d'État

  // --- Réseaux sociaux (laisser vide pour masquer) ---
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
  },

  /**
   * Formulaire de contact : collez ici l'URL d'un service de formulaire
   * (ex. Formspree, Web3Forms, Getform). Si vide, le formulaire ouvre
   * WhatsApp avec le message pré-rempli.
   */
  formEndpoint: '/api/leads', // les demandes arrivent directement dans l'espace admin (/admin)

  // Identifiants légaux (mentions légales, factures). Champ vide = ligne masquée.
  legal: {
    capital: '',
    rc: '', // TODO si applicable
    ice: '004073004000023',
    if: '73491470',
    tp: '', // TODO : taxe professionnelle si applicable
    director: 'Adraoui El Mehdi', // directeur de la publication
    host: 'À compléter (nom et adresse de l’hébergeur)', // TODO
  },

  // Auteur affiché sur les guides (E-E-A-T : idéalement un expert-comptable nommé)
  author: {
    name: 'Équipe juridique Ma Société', // TODO : nom + titre d'un expert réel
    role: 'Création et gestion d’entreprises au Maroc',
  },
} as const;

export const whatsappLink = (text = 'Bonjour, je souhaite créer ma société.') =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

/* ============================================================
 *  CATALOGUE DE PRIX (MAD HT) — source unique pour packs + simulateur
 * ============================================================ */
export const catalog = {
  creation: {
    'sarl-au': { label: 'SARL AU (associé unique)', short: 'SARL AU', price: 1690 },
    sarl: { label: 'SARL (2 associés ou plus)', short: 'SARL', price: 1990 },
    sas: { label: 'SAS (société par actions simplifiée)', short: 'SAS', price: 3490 },
    ae: { label: 'Auto-entrepreneur', short: 'Auto-entrepreneur', price: 490 },
  },
  // durée en mois -> prix total
  domiciliation: { 6: 900, 12: 1500, 24: 2640 } as Record<number, number>,
  comptabilite: { 3: 1500, 6: 2850, 12: 5400 } as Record<number, number>,
  comptabiliteAE: { 3: 450, 6: 840, 12: 1560 } as Record<number, number>, // déclarations trimestrielles AE
  extras: {
    cachet: { label: 'Cachet professionnel', price: 150 },
    logo: { label: 'Création de logo', price: 790 },
    banque: { label: 'Préparation du dossier bancaire', price: 0 },
  },
  domiciliationMonthlyFrom: 110, // "à partir de" affiché
  comptabiliteMonthlyFrom: 450,
  modificationFrom: 1490,
  dissolutionFrom: 2990,
} as const;

export type CreationForm = keyof typeof catalog.creation;
export type ExtraId = keyof typeof catalog.extras;

export interface Pack {
  id: string;
  name: string;
  price: number;
  tagline: string;
  popular?: boolean;
  form: CreationForm;
  domiciliation: number; // mois
  comptabilite: number; // mois
  extras: ExtraId[];
  features: string[];
  notIncluded?: string[];
}

export const packs: Pack[] = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: 2290,
    tagline: 'Votre société immatriculée, sans vous déplacer.',
    form: 'sarl-au',
    domiciliation: 6,
    comptabilite: 0,
    extras: ['cachet', 'banque'],
    features: [
      'Certificat négatif (réservation du nom)',
      'Rédaction des statuts sur mesure',
      'Enregistrement, RC, IF, ICE, taxe professionnelle',
      'Annonce légale et affiliation CNSS',
      'Domiciliation 6 mois à Casablanca',
      'Cachet professionnel',
      'Dossier d’ouverture de compte bancaire',
    ],
    notIncluded: ['Comptabilité', 'Logo'],
  },
  {
    id: 'lancement',
    name: 'Lancement',
    price: 3490,
    popular: true,
    tagline: 'Créer, s’installer et démarrer l’activité sereinement.',
    form: 'sarl-au',
    domiciliation: 12,
    comptabilite: 3,
    extras: ['cachet', 'logo', 'banque'],
    features: [
      'Tout le pack Essentiel',
      'Domiciliation 12 mois à Casablanca',
      '3 mois de comptabilité et déclarations TVA',
      'Création de votre logo',
      'Conseiller dédié sur WhatsApp',
    ],
  },
  {
    id: 'serenite',
    name: 'Sérénité',
    price: 5490,
    tagline: 'Une première année entièrement accompagnée.',
    form: 'sarl-au',
    domiciliation: 12,
    comptabilite: 6,
    extras: ['cachet', 'logo', 'banque'],
    features: [
      'Tout le pack Lancement',
      '6 mois de comptabilité et déclarations fiscales',
      'Point fiscal de démarrage (TVA, IS, CNSS)',
      'Priorité de traitement du dossier',
    ],
  },
];

export const packNote =
  'Prix pour une SARL AU. SARL à plusieurs associés : +300 MAD. Capital libre, pas de minimum légal pour la SARL.';

/** Valeur "à la carte" d'un pack, calculée depuis le catalogue (garantit la cohérence). */
export function packValue(p: Pack): number {
  let v = catalog.creation[p.form].price;
  if (p.domiciliation) v += catalog.domiciliation[p.domiciliation] ?? 0;
  if (p.comptabilite) v += catalog.comptabilite[p.comptabilite] ?? 0;
  for (const e of p.extras) v += catalog.extras[e].price;
  return v;
}

/** Format "2 290 MAD" avec espaces insécables (le prix ne se coupe jamais en fin de ligne). */
export const formatMAD = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n).replace(/ | | /g, ' ') + ' MAD';

/** Avis clients : ajoutez uniquement de VRAIS avis (nom, ville, texte). La section reste masquée tant que la liste est vide. */
export const testimonials: { name: string; company?: string; city: string; text: string }[] = [];
