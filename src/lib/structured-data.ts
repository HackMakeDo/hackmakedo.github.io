/** Shared JSON-LD builders. Site-wide facts live here once, instead of being repeated per page. */

export const SITE_URL = 'https://hackmakedo.com';
export const PERSON_ID = `${SITE_URL}/#person`;
export const ORG_ID = `${SITE_URL}/#organization`;
/** The author of every page and post. */
export const AUTHOR_NAME = 'Warren Buckley';

/** The Person + Organization graph, present on every page (CLAUDE.md / site-plan.md §5). */
export function personOrgGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: AUTHOR_NAME,
        description: 'UK-based Umbraco freelancer and contractor, nine-time Umbraco MVP, and the person behind Hack Make Do.',
        jobTitle: 'Freelance Umbraco Developer and Contractor',
        url: SITE_URL,
        image: `${SITE_URL}/images/warren-buckley.jpg`,
        knowsAbout: ['Umbraco', 'Umbraco upgrades', 'Umbraco backoffice extensions (Bellissima)', '.NET', 'C#', 'TypeScript', 'Lit', 'Web components', 'SignalR'],
        award: ['Umbraco MVP 2007', 'Umbraco MVP 2008', 'Umbraco MVP 2009', 'Umbraco MVP 2010', 'Umbraco MVP 2014', 'Umbraco MVP 2015', 'Umbraco MVP 2024', 'Umbraco MVP 2025', 'Umbraco MVP 2026'],
        sameAs: [
          'https://github.com/warrenbuckley',
          'https://www.linkedin.com/in/warrenbuckley/',
          'https://www.youtube.com/warrenbuckley',
          'https://umbracocommunity.social/@warrenbuckley',
          'https://stackoverflow.com/users/warren-buckley',
          'https://forum.umbraco.com/u/warren',
          'https://umb.fyi/@warrenbuckley',
          'https://sessionize.com/warrenbuckley/',
          'https://www.nuget.org/profiles/warrenbuckley',
          'https://marketplace.visualstudio.com/publishers/warren-buckley',
          'https://www.instagram.com/warrenbuckley/',
          'https://x.com/warrenbuckley',
          'https://www.flickr.com/photos/warrenbuckley/',
        ],
        worksFor: { '@id': ORG_ID },
      },
      {
        '@type': 'ProfessionalService',
        '@id': ORG_ID,
        name: 'Hack Make Do Limited',
        founder: { '@id': PERSON_ID },
        areaServed: 'GB',
        vatID: 'GB458891924',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Castle House, Castle Street',
          addressLocality: 'Guildford',
          postalCode: 'GU1 3UW',
          addressCountry: 'GB',
        },
        // Each Service is described in full (serviceSchema) on its own page; these @ids point to it.
        makesOffer: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', '@id': `${SITE_URL}/umbraco-freelancer/#service`, name: 'Umbraco freelancer' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', '@id': `${SITE_URL}/umbraco-contractor/#service`, name: 'Umbraco contractor' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', '@id': `${SITE_URL}/umbraco-upgrades/#service`, name: 'Umbraco upgrades' } },
        ],
      },
    ],
  };
}

/**
 * Google's "Profile Page" rich result, for the About page. References the Person node
 * from personOrgGraph() by @id rather than repeating its fields - that node is already
 * on every page (including this one), and JSON-LD @id references resolve across
 * multiple <script> blocks on the same page.
 */
export function profilePageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: { '@id': PERSON_ID },
  };
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Built from the same `trail` a PageHeader already renders, so it never drifts from the visible breadcrumbs. */
export function breadcrumbList(trail: BreadcrumbItem[], currentPath: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      item: new URL(crumb.href ?? currentPath, SITE_URL).toString(),
    })),
  };
}

export function articleSchema(options: { title: string; description: string; datePublished: Date; dateModified?: Date; url: string; image: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.title,
    description: options.description,
    datePublished: options.datePublished.toISOString(),
    dateModified: (options.dateModified ?? options.datePublished).toISOString(),
    url: new URL(options.url, SITE_URL).toString(),
    image: new URL(options.image, SITE_URL).toString(),
    // Name and URL inline as well as the @id: LinkedIn (and other link previews) don't follow @id references,
    // and Google's Article guidelines ask for author.name and author.url on the article itself.
    author: { '@type': 'Person', '@id': PERSON_ID, name: AUTHOR_NAME, url: `${SITE_URL}/about/` },
    publisher: { '@id': ORG_ID },
  };
}

/** Where the hire services are offered (decided 24 November 2026): the UK first, and Europe (e.g. the Council of the EU). */
const SERVICE_AREA = [
  { '@type': 'Country', name: 'United Kingdom' },
  { '@type': 'Place', name: 'Europe' },
];

/** A hire page's service, provided by Hack Make Do (the ProfessionalService node on every page). */
export function serviceSchema(options: { name: string; serviceType: string; description: string; url: string }) {
  const url = new URL(options.url, SITE_URL).toString();
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: options.name,
    serviceType: options.serviceType,
    description: options.description,
    url,
    provider: { '@id': ORG_ID },
    areaServed: SERVICE_AREA,
  };
}

export function faqPageSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer.replace(/<[^>]+>/g, '') },
    })),
  };
}

export function softwareSourceCodeSchema(options: { name: string; description: string; codeRepository: string; programmingLanguage: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: options.name,
    description: options.description,
    codeRepository: options.codeRepository,
    programmingLanguage: options.programmingLanguage,
    author: { '@id': PERSON_ID },
  };
}

/**
 * Google's "Software App" rich result (a different schema.org type from
 * SoftwareSourceCode above, and the one actually in its structured-data gallery) - for
 * a project with a real marketplace/store listing. `aggregateRating` is optional and
 * must only ever be the real figure from that listing: Google requires a genuine rating
 * or review count for this type to be rich-result eligible at all, so there's nothing to
 * gain from inventing one, and real harm in doing so.
 */
export function softwareApplicationSchema(options: {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem?: string;
  aggregateRating?: { ratingValue: number; reviewCount: number };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: options.name,
    description: options.description,
    url: options.url,
    applicationCategory: options.applicationCategory,
    operatingSystem: options.operatingSystem,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
    ...(options.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: options.aggregateRating.ratingValue,
        reviewCount: options.aggregateRating.reviewCount,
      },
    }),
    author: { '@id': PERSON_ID },
  };
}
