import { PROJECTS } from './projects';

/**
 * Which /work/<slug>/ case studies are live.
 *
 * Every case-study page is still built and viewable in `npm run dev`, so it can be written
 * and previewed. The production build drops any page not listed in PUBLISHED_CASE_STUDIES
 * (a hook in astro.config.mjs), the sitemap leaves it out, and every card links to GitHub
 * or nothing instead. To publish one: finish its copy, then add its slug here.
 */
export const PUBLISHED_CASE_STUDIES: readonly string[] = [];

/** Every case-study slug the site can build: the two hand-written pages plus each project. */
export const ALL_CASE_STUDIES: readonly string[] = [
  'council-of-the-european-union',
  'contentlock',
  ...PROJECTS.map((project) => project.slug),
];

export const HELD_CASE_STUDIES: readonly string[] = ALL_CASE_STUDIES.filter(
  (slug) => !PUBLISHED_CASE_STUDIES.includes(slug),
);

/** The case study's URL when it is published, otherwise undefined (so the card shows no link). */
export function caseStudyHref(slug: string | undefined): string | undefined {
  return slug && PUBLISHED_CASE_STUDIES.includes(slug) ? `/work/${slug}/` : undefined;
}
