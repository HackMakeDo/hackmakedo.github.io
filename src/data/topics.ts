/**
 * The 11 blog topics (from the 2026 WordPress import) that replace the old WordPress tags.
 * Order matches BlogIndex.dc.html's topic nav.
 */
export const TOPICS: { slug: string; label: string }[] = [
  { slug: 'umbraco', label: 'Umbraco' },
  { slug: 'bellissima', label: 'Bellissima' },
  { slug: 'umbraco-packages', label: 'Umbraco packages' },
  { slug: 'umbraco-forms', label: 'Umbraco Forms' },
  { slug: 'dotnet', label: '.NET' },
  { slug: 'javascript', label: 'JavaScript and TypeScript' },
  { slug: 'logging', label: 'Logging' },
  { slug: 'tooling', label: 'Tooling' },
  { slug: 'community', label: 'Community' },
  { slug: 'tutorials', label: 'Tutorials' },
  { slug: 'personal', label: 'Personal' },
];

export function topicLabel(slug: string): string {
  return TOPICS.find((t) => t.slug === slug)?.label ?? slug;
}
