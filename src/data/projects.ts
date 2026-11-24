/**
 * The open source packages and developer tools on /work/ that don't have a bespoke case
 * study page (ContentLock does, and stays hand-written in src/pages/work/contentlock/).
 * Each gets a case study at /work/<slug>/ from src/pages/work/[project]/index.astro,
 * matching page-designs/CaseContentLock.dc.html's structure with Placeholder copy
 * wherever the real story, screenshot or facts aren't known yet.
 */
export interface ProjectCaseStudy {
  slug: string;
  name: string;
  eyebrow: string;
  summary: string;
  chips: string[];
  builtWith: string;
  worksWith?: string;
  githubHref?: string;
  marketplaceHref?: string;
  /** Real figures only, pulled from the listing itself - never invented. Omit entirely
   * until a listing actually has reviews (Google requires a genuine rating or review
   * count for SoftwareApplication's rich-result eligibility anyway). */
  aggregateRating?: { ratingValue: number; reviewCount: number };
}

export const PROJECTS: ProjectCaseStudy[] = [
  {
    slug: 'examine-peek',
    name: 'Examine Peek',
    eyebrow: 'Open source · Umbraco package',
    summary: 'Inspect the Examine index for a content node, in Umbraco 14 and later.',
    chips: ['Umbraco', 'Examine'],
    builtWith: '.NET, Lit, TypeScript',
    worksWith: 'The Umbraco backoffice (Bellissima)',
    githubHref: 'https://github.com/warrenbuckley/Examine-Peek',
  },
  {
    slug: 'manifest-peek',
    name: 'Manifest Peek',
    eyebrow: 'Open source · Umbraco package',
    summary: 'Shows the manifests registered for each backoffice extension type, in Umbraco 14 and later.',
    chips: ['Umbraco', 'Bellissima'],
    builtWith: '.NET, Lit, TypeScript',
    worksWith: 'The Umbraco backoffice (Bellissima)',
    githubHref: 'https://github.com/warrenbuckley/Umbraco.Community.ManifestPeek',
  },
  {
    slug: 'user-2fa',
    name: 'User 2FA',
    eyebrow: 'Open source · Umbraco package',
    summary: 'Adds two-factor login for Umbraco backoffice users.',
    chips: ['Umbraco', 'Security'],
    builtWith: '.NET',
    worksWith: 'The Umbraco backoffice',
    githubHref: 'https://github.com/warrenbuckley/Umbraco.Community.User2FA',
  },
  {
    slug: 'iconoir-icon-pack',
    name: 'Iconoir Icon Pack',
    eyebrow: 'Open source · Umbraco package',
    summary: 'The open source Iconoir icon library, packaged for Umbraco 14 and later.',
    chips: ['Umbraco', 'Icons'],
    builtWith: '.NET',
    worksWith: 'The Umbraco backoffice (Bellissima)',
    githubHref: 'https://github.com/warrenbuckley/Umbraco.Community.IconPack.Iconoir',
  },
  {
    slug: 'our-umbraco-taghelpers',
    name: 'Our Umbraco TagHelpers',
    eyebrow: 'Open source · Umbraco package',
    summary: 'A community project of C# ASP.NET TagHelpers for Umbraco.',
    chips: ['Umbraco', '.NET'],
    builtWith: '.NET, ASP.NET TagHelpers',
    githubHref: 'https://github.com/umbraco-community/Our-Umbraco-TagHelpers',
  },
  {
    slug: 'compact-log-format-viewer',
    name: 'Compact Log Format Viewer',
    eyebrow: 'Open source · Developer tool',
    summary: 'A cross-platform desktop app for reading and querying the JSON log files that Serilog writes.',
    chips: ['Serilog', 'Desktop'],
    builtWith: 'Placeholder',
    githubHref: 'https://github.com/warrenbuckley/Compact-Log-Format-Viewer',
    marketplaceHref: 'https://apps.microsoft.com/detail/9n8rv8lktxrj',
    // No aggregateRating: the Microsoft Store listing has no reviews yet ("There aren't
    // any reviews yet", checked 2026-11-08) - add it here once it genuinely has some.
  },
  {
    slug: 'iis-express-code',
    name: 'IIS Express Code',
    eyebrow: 'Open source · Developer tool',
    summary: 'A Visual Studio Code extension that runs the open folder as a website with IIS Express.',
    chips: ['VS Code', 'IIS Express'],
    builtWith: 'TypeScript',
    worksWith: 'Visual Studio Code',
    githubHref: 'https://github.com/warrenbuckley/IIS-Express-Code',
    marketplaceHref: 'https://marketplace.visualstudio.com/items?itemName=warren-buckley.iis-express',
    aggregateRating: { ratingValue: 5, reviewCount: 21 }, // checked 2026-11-08
  },
];
