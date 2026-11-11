export interface NavLink {
  label: string;
  href: string;
  desc?: string;
  icon?: string;
}

export const creationLinks: NavLink[] = [
  { label: 'Création SARL', href: '/creation-sarl-maroc/', desc: 'Pour s’associer à 2 ou plus', icon: 'users' },
  { label: 'Création SARL AU', href: '/creation-sarl-au-maroc/', desc: 'Entreprendre seul, responsabilité limitée', icon: 'user' },
  { label: 'Auto-entrepreneur', href: '/auto-entrepreneur-maroc/', desc: 'Démarrer simplement, fiscalité réduite', icon: 'spark' },
  { label: 'Étrangers & MRE', href: '/creation-societe-maroc-etranger/', desc: 'Créer au Maroc depuis l’étranger', icon: 'globe' },
];

export const serviceLinks: NavLink[] = [
  { label: 'Domiciliation', href: '/domiciliation-entreprise-maroc/', desc: 'Adresse de siège social', icon: 'building' },
  { label: 'Comptabilité', href: '/comptabilite-entreprise-maroc/', desc: 'Déclarations, TVA, bilan', icon: 'calculator' },
  { label: 'Modifications juridiques', href: '/modification-societe-maroc/', desc: 'Transfert, cession, dissolution', icon: 'file' },
];

export const mainNav = [
  { label: 'Création', children: creationLinks },
  { label: 'Services', children: serviceLinks },
  { label: 'Tarifs', href: '/tarifs/' },
  { label: 'Guides', href: '/guides/' },
  { label: 'Contact', href: '/contact/' },
] as const;
