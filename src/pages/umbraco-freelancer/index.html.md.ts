import type { APIContext } from 'astro';
import { markdownResponse } from '../../lib/markdown-page';
import { caseStudyHref } from '../../data/case-studies';

const councilHref = caseStudyHref('council-of-the-european-union');

export function GET(_context: APIContext) {
  return markdownResponse(`# Umbraco freelancer

Warren Buckley is a UK-based freelance Umbraco developer and nine-time Umbraco MVP. He builds, upgrades and extends Umbraco sites and packages for agencies, product teams and organisations.

## Freelance Umbraco work

- Upgrades and migrations, including the rebuilt Bellissima backoffice, as done for the Council of the European Union.
- Backoffice extensions: custom dashboards, property editors and packages built with TypeScript and Lit web components.
- Finishing stalled builds, upgrades and integrations.
- Developer experience: templates, tooling and documentation.

## Recent client work

Council of the European Union: drove the migration of the Council's Umbraco site from version 13 to 16, and brought the in-house team up to speed on the new backoffice technology.${councilHref ? ` [Read the case study](https://hackmakedo.com${councilHref})` : ''}

## How I work

Based in the United Kingdom, works remotely, through Hack Make Do Limited.

Contact: warren@hackmakedo.com
`);
}
