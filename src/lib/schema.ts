import { site, packs } from '../config/site';
import { cities } from '../config/cities';

const abs = (path: string) => new URL(path, site.url).href;

export const ids = {
  org: `${site.url}/#organization`,
  business: `${site.url}/#business`,
  website: `${site.url}/#website`,
};

export function organization() {
  const sameAs = Object.values(site.social).filter(Boolean);
  return {
    '@type': 'Organization',
    '@id': ids.org,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: { '@type': 'ImageObject', url: abs('/logo.png'), width: 512, height: 512 },
    email: site.email,
    telephone: site.phoneE164,
    ...(site.legal.if ? { taxID: site.legal.if } : {}),
    ...(site.legal.ice
      ? { identifier: { '@type': 'PropertyValue', propertyID: 'ICE', value: site.legal.ice } }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function website() {
  return {
    '@type': 'WebSite',
    '@id': ids.website,
    url: site.url,
    name: site.name,
    inLanguage: site.lang,
    publisher: { '@id': ids.org },
  };
}

export function business() {
  return {
    '@type': 'ProfessionalService',
    '@id': ids.business,
    name: site.name,
    description: site.description,
    url: site.url,
    image: abs('/og-default.png'),
    logo: abs('/logo.png'),
    telephone: site.phoneE164,
    email: site.email,
    priceRange: '490 – 5490 MAD',
    currenciesAccepted: 'MAD',
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      ...(site.address.postalCode ? { postalCode: site.address.postalCode } : {}),
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    ...(site.geo ? { geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng } } : {}),
    openingHoursSpecification: site.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map((d) => `https://schema.org/${dayName[d]}`),
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: [
      { '@type': 'Country', name: 'Maroc' },
      ...cities.map((c) => ({ '@type': 'City', name: c.name })),
    ],
    parentOrganization: { '@id': ids.org },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Packs de création de société',
      itemListElement: packs.map((p) => ({
        '@type': 'Offer',
        name: `Pack ${p.name}`,
        description: p.tagline,
        price: p.price,
        priceCurrency: 'MAD',
        url: abs('/tarifs/'),
      })),
    },
  };
}

const dayName: Record<string, string> = {
  Mo: 'Monday',
  Tu: 'Tuesday',
  We: 'Wednesday',
  Th: 'Thursday',
  Fr: 'Friday',
  Sa: 'Saturday',
  Su: 'Sunday',
};

export function breadcrumbs(items: { name: string; href: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.href),
    })),
  };
}

export function faq(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

export function service(opts: {
  name: string;
  description: string;
  path: string;
  price?: number;
  serviceType?: string;
  area?: string;
}) {
  return {
    '@type': 'Service',
    name: opts.name,
    serviceType: opts.serviceType ?? opts.name,
    description: opts.description,
    url: abs(opts.path),
    provider: { '@id': ids.business },
    areaServed: opts.area ? { '@type': 'City', name: opts.area } : { '@type': 'Country', name: 'Maroc' },
    ...(opts.price
      ? {
          offers: {
            '@type': 'Offer',
            price: opts.price,
            priceCurrency: 'MAD',
            url: abs(opts.path),
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };
}

export function article(opts: {
  title: string;
  description: string;
  path: string;
  published: Date;
  updated?: Date;
}) {
  return {
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: abs(opts.path),
    mainEntityOfPage: abs(opts.path),
    datePublished: opts.published.toISOString(),
    dateModified: (opts.updated ?? opts.published).toISOString(),
    inLanguage: site.lang,
    image: abs('/og-default.png'),
    author: { '@type': 'Organization', name: site.author.name, url: abs('/a-propos/') },
    publisher: { '@id': ids.org },
  };
}
