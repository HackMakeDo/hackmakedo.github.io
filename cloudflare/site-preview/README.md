# Pull request previews (Cloudflare Worker Previews)

Every pull request gets its own copy of the built site, so a change can be checked in a browser before it's
merged. Production is unaffected: it stays on GitHub Pages.

- **How:** `.github/workflows/preview.yml` builds the site and runs `wrangler preview` with this folder's
  `wrangler.jsonc`, a static-assets-only Worker named `hackmakedo-preview` (no code, no routes, no production
  deployment). The Preview is named `pr-<number>`, so its address is
  `https://pr-<number>-hackmakedo-preview.hackmakedo.workers.dev`. The link is posted on the pull request and
  updated on every push. When the pull request closes, the Preview is deleted.
- **Search engines:** `workers.dev` Preview URLs carry `X-Robots-Tag: noindex` (checked 24 November 2026), and every
  page's canonical URL points at https://hackmakedo.com.
- **Same as production:** a Preview is a production build, so held case studies are left out exactly as on the live
  site. What it doesn't have: the hackmakedo.com Workers (blog redirects, Markdown negotiation) and Cloudflare Web
  Analytics.
- **Limits (Free plan):** 100 Previews per Worker; at the limit Cloudflare deletes the least recently deployed one.
- **Forks:** pull requests from forks don't get the repository's secrets, so they get no Preview.

## Setup (once)

1. Create a Cloudflare API token with **Account › Workers Scripts › Edit** for this account.
2. In the GitHub repo, add two secrets: `CLOUDFLARE_API_TOKEN` (the token) and `CLOUDFLARE_ACCOUNT_ID`.

## By hand

From the repo root, after `npm run build` (and `npx wrangler login`):

```sh
npx wrangler preview --config cloudflare/site-preview/wrangler.jsonc --name my-test
npx wrangler preview delete --config cloudflare/site-preview/wrangler.jsonc --name my-test --skip-confirmation
```

Don't run `wrangler pages …` commands in this repo: Wrangler now hands them to its Workers auto-setup, which runs
`astro add cloudflare` and rewrites `astro.config.mjs`, `package.json` and `tsconfig.json`.

**Undo:** delete `.github/workflows/preview.yml`, then the `hackmakedo-preview` Worker in the Cloudflare dashboard.
