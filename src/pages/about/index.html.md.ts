import type { APIContext } from 'astro';
import { markdownResponse } from '../../lib/markdown-page';

export function GET(_context: APIContext) {
  return markdownResponse(`# Warren Buckley

Warren Buckley is a UK-based Umbraco freelancer and contractor, a nine-time Umbraco MVP, and the person behind Hack Make Do. Hacker, Maker, Do'er.

I'm a freelance Umbraco developer and contractor based in the UK, and a nine-time Umbraco MVP. I found Umbraco around 2005, later worked at Umbraco HQ on the CMS core team and as a developer advocate, and now help teams through Hack Make Do.

## Twenty years with Umbraco

- Started as a junior web developer at Momo Web Communications in 2002, and found Umbraco in 2005.
- Joined the Umbraco agency XEED in Oslo, then Umbraco HQ in 2011, where he helped organise Codegarden.
- Built Umbraco sites at The Cogworks, and ran uHangout, a weekly community show on YouTube.
- Went back to Umbraco HQ in 2016 on the CMS core team, then became a developer advocate in 2021.
- Started Hack Make Do in September 2023, and volunteers on the Umbraco Package Team.

Full timeline: https://hackmakedo.com/timeline/
`);
}
