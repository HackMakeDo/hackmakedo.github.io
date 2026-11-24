import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { markdownResponse } from '../../lib/markdown-page';

export async function GET(_context: APIContext) {
  const entries = (await getCollection('timeline')).sort(
    (a, b) => b.data.year - a.data.year || b.data.order - a.data.order,
  );

  const lines = entries.map((e) => `- **${e.data.yearLabel}** (${e.data.type}): ${e.data.title} — ${e.data.body}`);

  return markdownResponse(`# Twenty years with Umbraco

Every role, MVP award, project and community contribution since Warren Buckley started as a junior web developer in 2002.

${lines.join('\n')}
`);
}
