# Markdown for agents (Cloudflare Worker)

Cloudflare's own "Markdown for Agents" switch needs a Pro plan; this Worker does the same job on the Free plan.
A request whose `Accept` header prefers `text/markdown` gets the page's Markdown copy, with
`Content-Type: text/markdown`, `Vary: Accept`, an `x-markdown-tokens` estimate and a canonical `Link` to the page.
Every other request passes straight through to GitHub Pages; HTML responses gain `Vary: Accept` and discovery
`Link` headers (RFC 8288): every page links its Markdown copy (`rel="alternate"`), and the homepage also links
`/llms.txt` (`rel="describedby"`). There is no `api-catalog` or `service-desc`: the site has no API.

- The copies are written by the build: `<page>/index.html.md` for every page (`src/lib/markdown-copies.ts`,
  converted from the page's own HTML; the five hand-written summaries in `src/pages/**/index.html.md.ts` win).
  Each page also links its copy with `<link rel="alternate" type="text/markdown">`.
- `src/negotiate.ts`: the logic, tested offline by `npm run markdown` (also run after every `npm run build`).

## Deploy (launch day, after the new site is live)

From the repo root (after `npx wrangler login`, already done for the blog redirects):

```sh
npm run deploy:markdown
```

This creates the Worker `hackmakedo-markdown-negotiation` on the route `hackmakedo.com/*`. Then, from the repo root:

```sh
npm run markdown -- --live
```

Optional: check it with https://isitagentready.com (Content accessibility › Markdown negotiation).

**Undo:** Cloudflare dashboard › Workers & Pages › `hackmakedo-markdown-negotiation` › Settings › Domains & Routes,
delete the route. The site is served exactly as before.

**Cost:** every request to hackmakedo.com runs the Worker (a few milliseconds). The Free plan allows 100,000 requests
a day, far above this site's traffic. If that ever runs short, requests over the limit fail open or closed depending
on the route's failure mode. Set it to **Fail open** in the dashboard (it can't be set from Wrangler): Workers &
Pages › `hackmakedo-markdown-negotiation` › Settings › Domains & Routes, on the `hackmakedo.com/*` route. Fail open
skips the Worker and serves the site as normal; fail closed would show visitors a Cloudflare 1027 error page.
