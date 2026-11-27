import type { OgImageOptions } from '../lib/og-image';
import { PROJECTS } from './projects';

/**
 * One entry per non-blog page that gets a generated OG card (src/pages/og/[...slug].png.ts).
 * `slug` is the path under /og/ the image is built at, and what each page's `ogImage` prop
 * should point to (e.g. `/og/${slug}.png`).
 */
export const OG_PAGES: { slug: string; card: OgImageOptions }[] = [
  { slug: 'home', card: { title: 'Warren Buckley, Umbraco Freelancer and Contractor' } },
  { slug: 'umbraco-freelancer', card: { eyebrow: 'Hire', title: 'Umbraco Freelancer' } },
  { slug: 'umbraco-contractor', card: { eyebrow: 'Hire', title: 'Umbraco Contractor' } },
  { slug: 'umbraco-upgrades', card: { eyebrow: 'Hire', title: 'Umbraco Upgrades' } },
  { slug: 'umbraco-upgrades/13-to-17', card: { eyebrow: 'Guide', title: 'How to upgrade Umbraco 13 to 17' } },
  { slug: 'about', card: { eyebrow: 'About', title: 'Warren Buckley' } },
  { slug: 'work', card: { eyebrow: 'Work', title: 'Client work and open source' } },
  { slug: 'work/council-of-the-european-union', card: { eyebrow: 'Client work', title: 'Council of the European Union' } },
  { slug: 'work/contentlock', card: { eyebrow: 'Open source', title: 'ContentLock' } },
  { slug: 'timeline', card: { eyebrow: 'Timeline', title: 'Twenty years with Umbraco' } },
  { slug: 'kind-words', card: { eyebrow: 'Kind words', title: 'Recommendations' } },
  { slug: 'contact', card: { eyebrow: 'Contact', title: 'Get in touch' } },
  { slug: 'blog', card: { eyebrow: 'Blog', title: 'Blog' } },
  ...PROJECTS.map((project) => ({
    slug: `work/${project.slug}`,
    card: { eyebrow: 'Open source', title: project.name } satisfies OgImageOptions,
  })),
];
