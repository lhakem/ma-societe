/**
 * Configuration de l'espace d'administration : statuts, étapes de dossier, sources.
 * Modifiez librement les libellés et les étapes.
 */

export const clientStatuses = {
  nouveau: { label: 'Nouveau contact', tone: 'brand' },
  devis: { label: 'Devis envoyé', tone: 'saffron' },
  en_cours: { label: 'Dossier en cours', tone: 'blue' },
  termine: { label: 'Terminé', tone: 'mint' },
  perdu: { label: 'Perdu', tone: 'grey' },
} as const;
export type ClientStatus = keyof typeof clientStatuses;

/** Étapes du dossier selon le type de prestation (affichées dans le suivi client). */
export const dossierSteps: Record<string, string[]> = {
  creation: [
    'Documents reçus',
    'Certificat négatif obtenu',
    'Statuts rédigés et signés',
    'Enregistrement, IF, ICE et TP',
    'Immatriculation au registre du commerce',
    'Annonce légale et affiliation CNSS',
    'Dossier remis au client',
  ],
  ae: ['Documents reçus', 'Inscription déposée', 'Carte auto-entrepreneur reçue', 'Dossier remis au client'],
  domiciliation: ['Contrat de domiciliation signé', 'Attestation délivrée', 'Domiciliation active'],
  comptabilite: ['Lettre de mission signée', 'Reprise du dossier comptable', 'Suivi mensuel actif'],
  modification: [
    'Documents reçus',
    'Actes rédigés (PV, statuts)',
    'Enregistrement',
    'Dépôt au greffe et annonce légale',
    'Registre du commerce modifié',
    'Dossier remis au client',
  ],
  autre: ['Demande reçue', 'En traitement', 'Terminé'],
};

export const services: { label: string; steps: keyof typeof dossierSteps }[] = [
  { label: 'Création SARL AU', steps: 'creation' },
  { label: 'Création SARL', steps: 'creation' },
  { label: 'Création SAS', steps: 'creation' },
  { label: 'Auto-entrepreneur', steps: 'ae' },
  { label: 'Domiciliation', steps: 'domiciliation' },
  { label: 'Comptabilité', steps: 'comptabilite' },
  { label: 'Modification / dissolution', steps: 'modification' },
  { label: 'Autre question', steps: 'autre' },
];

export const stepsFor = (service: string | null | undefined) =>
  dossierSteps[services.find((s) => s.label === service)?.steps ?? 'autre'];

export const sources = ['Site web', 'WhatsApp', 'Téléphone', 'Recommandation', 'Réseaux sociaux', 'Bureau', 'Autre'];

export const devisStatuses = {
  brouillon: { label: 'Brouillon', tone: 'grey' },
  envoye: { label: 'Envoyé', tone: 'saffron' },
  accepte: { label: 'Accepté', tone: 'mint' },
  refuse: { label: 'Refusé', tone: 'danger' },
} as const;

export const factureStatuses = {
  brouillon: { label: 'Brouillon', tone: 'grey' },
  emise: { label: 'À payer', tone: 'saffron' },
  partielle: { label: 'Payée en partie', tone: 'blue' },
  payee: { label: 'Payée', tone: 'mint' },
  annulee: { label: 'Annulée', tone: 'danger' },
} as const;

export const statusOf = (type: string, status: string) =>
  ((type === 'devis' ? devisStatuses : factureStatuses) as Record<string, { label: string; tone: string }>)[status] ?? {
    label: status,
    tone: 'grey',
  };

export const paymentMethods = ['Virement', 'Espèces', 'Chèque', 'Versement bancaire', 'Carte bancaire'];
export const vatRates = [20, 14, 10, 7, 0];
