import type { APIContext } from 'astro';
import { markdownResponse } from '../lib/markdown-page';

export function GET(_context: APIContext) {
  return markdownResponse(`# Hack Make Do

Warren Buckley, a freelance Umbraco developer and contractor and nine-time Umbraco MVP, making Umbraco better for the developers who build with it.

## 9× Umbraco MVP

First Umbraco MVP award: 2007. 20 years building with Umbraco. Clients and projects include the Council of the European Union.

## How I can help

- Improve your product's developer experience: templates, tooling and backoffice extensions.
- Add capacity to your development team: an experienced Umbraco contractor.
- Bring your projects over the finish line: freelance Umbraco development.
- Get involved in the Umbraco community.

## Links

- [Umbraco freelancer](https://hackmakedo.com/umbraco-freelancer/)
- [Umbraco contractor](https://hackmakedo.com/umbraco-contractor/)
- [About](https://hackmakedo.com/about/)
- [Work](https://hackmakedo.com/work/)
- [Blog](https://hackmakedo.com/blog/)
- [Timeline](https://hackmakedo.com/timeline/)
- [Contact](https://hackmakedo.com/contact/)
`);
}
