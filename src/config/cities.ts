/**
 * Pages villes : /creation-societe-{slug}/
 * Chaque ville a un contenu propre (tribunal, CRI, quartiers, secteurs)
 * pour éviter le contenu dupliqué. Ne créez pas de ville sans contenu unique.
 */
export interface City {
  slug: string;
  name: string;
  /** "à Casablanca", "à Fès"… */
  prep: string;
  region: string;
  tribunal: string;
  cri: string;
  districts: string[];
  sectors: string[];
  nearby: string[];
  /** Domiciliation proposée directement par Ma Société dans cette ville */
  domiciliation: boolean;
  intro: string;
  local: string;
  geo: { lat: number; lng: number };
}

export const cities: City[] = [
  {
    slug: 'casablanca',
    name: 'Casablanca',
    prep: 'à Casablanca',
    region: 'Casablanca-Settat',
    tribunal: 'Tribunal de commerce de Casablanca',
    cri: 'CRI Casablanca-Settat',
    districts: ['Maârif', 'Casablanca Finance City (Anfa)', 'Sidi Maârouf', 'Gauthier – Zerktouni', 'Aïn Sebaâ'],
    sectors: ['Services aux entreprises', 'Commerce et distribution', 'Finance et assurance', 'Offshoring et IT', 'Logistique portuaire'],
    nearby: ['Mohammedia', 'Bouskoura', 'Dar Bouazza', 'Berrechid', 'Settat', 'El Jadida'],
    domiciliation: true,
    intro:
      "Capitale économique du pays, Casablanca concentre une grande partie des créations de sociétés au Maroc. C'est aussi là que se trouvent nos bureaux : nous y gérons chaque dossier de bout en bout, du certificat négatif à l'immatriculation au registre du commerce.",
    local:
      "À Casablanca, votre société est immatriculée au registre du commerce tenu par le Tribunal de commerce de Casablanca. Le choix du siège social compte : une adresse au Maârif, à Gauthier ou dans le quartier de Casablanca Finance City renvoie une image solide à vos clients et à votre banque. Avec notre domiciliation, vous disposez d'une adresse professionnelle sans payer de bureau, et nous réceptionnons votre courrier. Les créateurs qui ont besoin d'un local de stockage ou d'atelier s'orientent plutôt vers Sidi Maârouf, Aïn Sebaâ ou Bouskoura, où les loyers sont plus adaptés.",
    geo: { lat: 33.5731, lng: -7.5898 },
  },
  {
    slug: 'rabat',
    name: 'Rabat',
    prep: 'à Rabat',
    region: 'Rabat-Salé-Kénitra',
    tribunal: 'Tribunal de commerce de Rabat',
    cri: 'CRI Rabat-Salé-Kénitra',
    districts: ['Agdal', 'Hay Riad', 'Hassan', 'Souissi', 'Technopolis (Salé)'],
    sectors: ['Conseil et ingénierie', 'Numérique et IT', 'Formation', 'Services aux institutions', 'Industrie automobile (Kénitra)'],
    nearby: ['Salé', 'Témara', 'Skhirat', 'Kénitra'],
    domiciliation: false,
    intro:
      "Capitale administrative, Rabat attire les cabinets de conseil, les sociétés de services numériques et les entreprises qui travaillent avec les institutions publiques. Nous y créons votre société entièrement à distance : vous n'avez aucun déplacement à faire.",
    local:
      "Une société dont le siège est à Rabat est immatriculée auprès du Tribunal de commerce de Rabat. Les quartiers d'Agdal et de Hay Riad regroupent la majorité des bureaux et centres d'affaires, tandis que Technopolis, à Salé, accueille de nombreuses entreprises du numérique. Si vous visez des marchés publics, prévoyez dès la création un objet social précis et des statuts adaptés : c'est ce que nous vérifions avec vous avant le dépôt du dossier.",
    geo: { lat: 34.0209, lng: -6.8416 },
  },
  {
    slug: 'marrakech',
    name: 'Marrakech',
    prep: 'à Marrakech',
    region: 'Marrakech-Safi',
    tribunal: 'Tribunal de commerce de Marrakech',
    cri: 'CRI Marrakech-Safi',
    districts: ['Guéliz', 'Hivernage', 'Sidi Ghanem', 'Targa', 'Route de l’Ourika'],
    sectors: ['Tourisme et hébergement', 'Restauration', 'Événementiel', 'Artisanat et décoration', 'Immobilier'],
    nearby: ['Tamansourt', 'Ben Guerir', 'Essaouira', 'Safi'],
    domiciliation: false,
    intro:
      "Tourisme, restauration, riads, événementiel, artisanat : Marrakech est l'une des villes où l'on crée le plus d'entreprises tournées vers les visiteurs et l'export. Nous préparons votre dossier à distance et suivons l'immatriculation jusqu'au bout.",
    local:
      "À Marrakech, l'immatriculation se fait auprès du Tribunal de commerce de Marrakech. Beaucoup d'activités locales demandent des autorisations en plus de la création de la société : classement d'un établissement touristique, licence pour la restauration, autorisation d'exploitation d'une maison d'hôtes. Nous rédigeons un objet social qui couvre votre activité réelle afin d'éviter une modification des statuts plus tard. Les zones de Guéliz et de l'Hivernage accueillent les bureaux, Sidi Ghanem les ateliers et les showrooms.",
    geo: { lat: 31.6295, lng: -7.9811 },
  },
  {
    slug: 'tanger',
    name: 'Tanger',
    prep: 'à Tanger',
    region: 'Tanger-Tétouan-Al Hoceïma',
    tribunal: 'Tribunal de commerce de Tanger',
    cri: 'CRI Tanger-Tétouan-Al Hoceïma',
    districts: ['Centre-ville (Bd Mohammed V)', 'Malabata', 'Iberia', 'Gzenaya – zone franche', 'Zone Tanger Med'],
    sectors: ['Logistique et transport', 'Import-export', 'Industrie automobile', 'Textile', 'E-commerce'],
    nearby: ['Tétouan', 'Asilah', 'Larache', 'M’diq', 'Fnideq'],
    domiciliation: false,
    intro:
      "Port de Tanger Med, zones franches, industrie automobile : Tanger est la ville du commerce international et de la logistique. Nous y créons des sociétés d'import-export, de transport et de services, avec un objet social pensé pour l'activité douanière.",
    local:
      "Les sociétés dont le siège est à Tanger sont immatriculées au Tribunal de commerce de Tanger. Pour une activité d'import-export, l'objet social doit mentionner clairement le commerce international : c'est ce qui vous permettra ensuite d'obtenir votre code en douane sans difficulté. Les entreprises qui s'installent en zone franche (Tanger Free Zone, Tanger Automotive City) relèvent d'un régime particulier : nous vous indiquons les démarches spécifiques avant de lancer la création.",
    geo: { lat: 35.7595, lng: -5.834 },
  },
  {
    slug: 'agadir',
    name: 'Agadir',
    prep: 'à Agadir',
    region: 'Souss-Massa',
    tribunal: 'Tribunal de commerce d’Agadir',
    cri: 'CRI Souss-Massa',
    districts: ['Centre-ville', 'Founty', 'Talborjt', 'Tassila', 'Aït Melloul'],
    sectors: ['Agro-industrie et export de primeurs', 'Pêche et produits de la mer', 'Tourisme balnéaire', 'BTP', 'Sport et surf'],
    nearby: ['Inezgane', 'Aït Melloul', 'Taghazout', 'Taroudant', 'Tiznit'],
    domiciliation: false,
    intro:
      "Agriculture d'export, pêche, tourisme et sports de glisse : la région Souss-Massa offre des débouchés très variés. Nous accompagnons les créateurs d'Agadir à distance, sans qu'ils aient à multiplier les allers-retours dans les administrations.",
    local:
      "À Agadir, l'immatriculation est assurée par le Tribunal de commerce d'Agadir. Les activités liées à l'export de produits agricoles ou de la mer impliquent souvent des démarches complémentaires (agrément sanitaire, enregistrement auprès des services de contrôle) : nous en tenons compte dès la rédaction des statuts. Les bureaux se trouvent surtout dans le centre et à Founty, les activités industrielles et logistiques à Tassila et Aït Melloul.",
    geo: { lat: 30.4278, lng: -9.5981 },
  },
  {
    slug: 'fes',
    name: 'Fès',
    prep: 'à Fès',
    region: 'Fès-Meknès',
    tribunal: 'Tribunal de commerce de Fès',
    cri: 'CRI Fès-Meknès',
    districts: ['Ville nouvelle (Bd Mohammed V)', 'Route d’Imouzzer', 'Agdal', 'Sidi Brahim', 'Fès Shore'],
    sectors: ['Artisanat, cuir et textile', 'Offshoring et centres d’appels', 'Agroalimentaire', 'Tourisme culturel', 'Enseignement privé'],
    nearby: ['Meknès', 'Sefrou', 'Ifrane', 'Taza'],
    domiciliation: false,
    intro:
      "Ville d'artisanat et de savoir-faire, Fès attire aussi les centres de services et les entreprises numériques grâce au parc Fès Shore. Nous créons votre société à distance et vous guidons dans le choix de la forme juridique.",
    local:
      "Une société domiciliée à Fès est immatriculée au Tribunal de commerce de Fès. Les artisans qui veulent vendre à l'export ont souvent intérêt à passer d'un statut d'auto-entrepreneur à une SARL AU dès que le chiffre d'affaires augmente : nous vous aidons à faire ce passage au bon moment. Les bureaux se trouvent principalement en ville nouvelle et sur la route d'Imouzzer, les ateliers à Sidi Brahim.",
    geo: { lat: 34.0331, lng: -5.0003 },
  },
];
