# hackmakedo.com rebuild

hackmakedo.com is a static Astro site on GitHub Pages, behind Cloudflare, so Warren Buckley is found and hired as an **Umbraco freelancer** and **Umbraco contractor**. It launched on 24 November 2026. The design is done: keep to it; don't redesign it. How to run, build and deploy it is in `README.md`; what's still open is in `TODO.md`.

## What is in this folder

| Path | What it is | How to use it |
| --- | --- | --- |
| `design-system/README.md` | Brand book: voice, colour, type, layout, shape, motion, rules | Read first. Its rules are binding. |
| `design-system/site-plan.md` | Search targets, page map, GEO (`llms.txt`, `robots.txt`), technical SEO and the PageSpeed 100 budget, privacy, blog migration, build approach | Read second. Decisions marked "decided" are final. |
| `design-system/tokens.css`, `tokens.json` | Design tokens (Night = `dark`, Paper = `light`) | Ship as-is; generate nothing new from them. |
| `design-system/components/bundle.css` | Every `hmd-` component style | The site's only component CSS. Inline it, minified, with `tokens.css`. |
| `design-system/components/bundle.js` | `hmd-copy` and `hmd-video` custom elements | Ship as-is or port one-to-one to Lit. |
| `design-system/components/<Name>/` | `README.md` (what the page must provide) and `preview.html` (reference markup) for each component | Turn each into an Astro component with the same markup and classes. |
| `page-designs/*.dc.html` | The approved design of each page template (open in a browser to view) | The markup inside `<x-dc>` is plain HTML with `hmd-` classes. Copy its structure and copy. Ignore the `<x-dc>`, `<helmet>` and `data-dc-script` wrappers; they belong to the design tool. |
| `cloudflare/blog-redirects/` | Worker for the old blog, with `blog-url-map.csv` (all 471 old URLs, their new URL and the rule R01 to R13) | Edit the CSV, then `npm run redirects -- --build-map`, `npm run redirects` and `npm run deploy:redirects`. |
| `cloudflare/markdown-negotiation/` | Worker serving each page's Markdown copy for `Accept: text/markdown`, plus discovery `Link` headers | `npm run markdown`, then `npm run deploy:markdown`. |
| `cloudflare/personal-domains/` | Worker for `warren-buckley.co.uk` and `warrenbuckley.co.uk`: 301 to `/about/`, and answers the old IIS Express extension's sponsor check | `npm run deploy:personal-domains`. Keep `warren-buckley.co.uk` registered (the extension sends GitHub tokens to it). |
| `cloudflare/site-preview/` | Config for pull request previews (Worker Previews of `dist/` at `pr-<n>-hackmakedo-preview.hackmakedo.workers.dev`), used by `.github/workflows/preview.yml` | Nothing to run. Never run `wrangler pages …` here: it runs `astro add cloudflare` on the repo. |
| `lighthouse/` | Lighthouse CI configs and URL lists | Add a page type's URL to `lighthouse-urls.cjs` when it goes live. |
| `docs/` | Plans for later work (e.g. `umbraco-versions-plan.md`) | Read before starting that work. |

## Templates and their designs

| Template | Design | URL |
| --- | --- | --- |
| Home | `Main.dc.html` | `/` |
| Hire page | `Freelancer.dc.html`, `Contractor.dc.html` | `/umbraco-freelancer/`, `/umbraco-contractor/` |
| About | `About.dc.html` | `/about/` |
| Work listing | `Work.dc.html` | `/work/` |
| Client case study | `CaseCouncil.dc.html` | `/work/<client-slug>/` |
| Project case study | `CaseContentLock.dc.html` | `/work/<project-slug>/` |
| Blog listing | `BlogIndex.dc.html` | `/blog/`, `/blog/page/<n>/`, `/blog/topic/<topic>/` |
| Blog post | `BlogPost.dc.html` | `/blog/<slug>/` |
| Timeline | `Timeline.dc.html` | `/timeline/` |
| Recommendations | `KindWords.dc.html` | `/kind-words/` |
| Contact | `Contact.dc.html` | `/contact/` |
| Not found | `NotFound.dc.html` | `/404.html` |
| Plain text page | `Privacy.dc.html` | `/privacy/` and any future simple page |

One template per page type: the 64 migrated posts all use the blog post template.

## Decisions made after the design system was written (these win)

- **Every page is Night** (`data-theme="dark"`), blog posts included. Paper is for print only.
- **Pink end band.** Each page ends with one full-width pink band directly above the footer: the HireBanner, or the ContactCard on hire and contact pages. The styles are the `.hmd-pink` rules in each design's `<style>` block (a token remap: pink ground, navy text, navy button with pink text, underlined navy links, navy focus ring). Add them to `bundle.css` as `.hmd-pink`. Not on 404 or plain text pages.
- **Credentials section** (Home, About, Contractor): a large "9× Umbraco MVP" heading, the stats "First Umbraco MVP award 2007" and "20 years building with Umbraco", a text row of client names, and the 2026 badge shown large on the right. No row of all nine badges; the badges appear on the timeline.
- **Client names are text, never logos.** Client work was done as a contractor through agencies (Gibe Digital, Manifesto Digital) and for the Council of the European Union. **Don't publish any client name until Warren confirms permission**; make the client list data-driven so a name can be dropped in one place. Confirmed (20 November 2026): the Council of the European Union, and Dyson, Tottenham Hotspur and Wolverhampton Wanderers through Gibe Digital. Manifesto Digital's client must not be named, only described ("A global food safety standards body"): never write its name anywhere in this repo, which is public.
- **Hire pages:** no day rate anywhere; Warren works remotely, from the UK. The contractor page has no "How a contract works" or "Contract terms" sections.
- **Recommendations on Home and the freelancer page** are a carousel (`Carousel.astro`): a scroll-snap row of whole quotes (two per view from 760px, one below), never auto-advancing, keyboard-scrollable. The `hmd-carousel` Lit element adds previous/next buttons, markers and a polite status message in every browser; without JavaScript it stays a swipeable row with a themed scrollbar. Don't use `::scroll-button()` or `::scroll-marker` (Chromium only).
- **Timeline:** newest first by default (toggle to oldest), one continuous line at a fixed position behind a fixed-width year column, the MVP badge to the right of the entry text, and a pink progress line that fills on scroll with a CSS scroll-driven animation (`animation-timeline: view()`), shown full when unsupported or under reduced motion. Entries are in `src/content/timeline/`.
- **Case studies are held until written.** `src/data/case-studies.ts` lists the published ones (none at launch). Unpublished `/work/<slug>/` pages still build in dev, but a hook in `astro.config.mjs` removes them and their OG images from the production build, the sitemap skips them, and every link goes through `caseStudyHref()` so cards show GitHub (projects) or no link (clients). Never hard-code a `/work/<slug>/` link.
- **Upgrades banner and page.** A tilted pink `Marquee` (Lit `hmd-marquee`) under the hero on Home links to `/umbraco-upgrades/`. Home only: the tilt looks wrong under the straight header on other pages. The whole ribbon is the link; it pauses on hover, focus and its pause button, and stands still under reduced motion. The upgrades page's version table comes from `src/data/umbraco-versions.ts` (Umbraco's lifecycle dates, statuses worked out at build). Never edit those dates by hand: `npm run check:umbraco-versions` compares them with Umbraco's page, and `-- --write` rewrites them.
- **Search:** Pagefind, built after `astro build`, loaded only when the search box gets focus. Without JavaScript the form falls back to a site-limited web search. Currently only on the 404 page.
- **Markdown for agents.** Every page gets a Markdown copy at `<page>/index.html.md`, written after the build from the page's own HTML (`src/lib/markdown-copies.ts`; a hand-written `index.html.md.ts` endpoint wins) and linked with `<link rel="alternate" type="text/markdown">`. The Worker in `cloudflare/markdown-negotiation/` serves it for `Accept: text/markdown`. `npm run markdown` (run after every build) fails if a page has no copy.
- **Blog topics:** 11 topics replace 169 tags (`src/data/topics.ts`). Topic pages use the blog listing template.
- **Old blog:** `blog.hackmakedo.com` is answered only by the redirect Worker (301 to the same content here; unknown URLs go to `/blog/`). Keep it running: old links never stop arriving.

## How the site works

- Astro, static output, TypeScript strict, trailing slashes. Deployed by GitHub Actions on every push to `main`; pull requests run Lighthouse CI on the main page types and must score 100 in every category (`npm run lighthouse:full` checks every page).
- Base layout: SkipLink, SiteHeader, SiteFooter, inlined minified CSS (`src/styles/tokens.css` and `bundle.css`, the only component CSS), self-hosted subset WOFF2 fonts (Montserrat, Source Sans 3; no Google Fonts).
- One `.astro` component per design-system component, matching its preview markup. Logotype takes a unique mask id per instance.
- Content collections with schemas: posts, case studies, testimonials (verbatim, linking to the person's LinkedIn), clients, timeline, FAQs.
- Code blocks: Shiki `css-variables` theme, `@shikijs/transformers` for highlight and diff, and a rehype step that wraps each block in the CodeBlock figure with language, filename (`title="…"` in the fence meta) and copy button.
- SEO and GEO (`design-system/site-plan.md`): JSON-LD, sitemap (also copied to `/sitemap.xml` for the old address), RSS at `/blog/rss.xml`, `llms.txt`, Markdown copies, `robots.txt` with Content Signals.
- The `bundle.css` minifier drops the space before `:is(`/`:not(` in a descendant selector, silently changing what it matches. Write one selector per element (`.x a:focus-visible, .x button:focus-visible`) or `el:not(pre > el)` instead.
- `package-lock.json` must install with npm 10 (CI runs Node 22). After changing dependencies, check with `npx npm@10 ci --dry-run`.
- The repo is public. Never push history that names a client without permission (see Decisions).

## Rules

- Never invent copy, clients, quotes, numbers or screenshots. Anything missing stays visibly "Placeholder" and is listed for Warren.
- UK English. The company is "Hack Make Do" (three words); the legal name is Hack Make Do Limited.
- Accessibility is part of done: real buttons and links, labels, visible 3px focus rings, contrast as in the tokens, reduced motion respected.
- Nothing from a third party loads with the page (YouTube only on click). The one exception is Cloudflare Web Analytics, which Cloudflare adds at the edge (cookieless, chosen over Google Analytics, covered on the privacy page). No cookies, so no cookie banner.
- Videos in posts use `<hmd-video class="hmd-video" provider="youtube|vimeo|ted" video-id="…" label="…">` (TED's id is the slug from ted.com/talks/<slug>) with a fallback link inside, the open tag on its own line (see any post). Posters are self-hosted: run `npm run video-posters` after adding one; `npm run build` fails if a poster is missing. Never load a thumbnail from YouTube, Vimeo or TED at page load, and never paste a provider's own embed snippet. Add a new provider to the element, the poster script and the privacy page together. Instagram can embed (`provider="instagram"`, `kind="reel"`) but only if the account allows embeds; otherwise link to it.
- No animated GIFs in posts: convert each to a muted MP4 plus a still first frame and wrap it in `<figure class="hmd-figure"><hmd-loop class="hmd-loop"><video src="….mp4" poster="….jpg" width="…" height="…" muted loop playsinline preload="none" controls aria-label="…"></video></hmd-loop></figure>`. It plays while on screen, has a pause button (WCAG 2.2.2) and stays still under reduced motion. Convert with `ffmpeg -i in.gif -an -movflags +faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 26 out.mp4` (screen recordings: `-tune stillimage -crf 32`) and `ffmpeg -i in.gif -frames:v 1 -q:v 3 out.jpg`.
- GitHub gists in posts use `<hmd-gist class="hmd-gist" gist="user/id" label="…">` with a fallback link inside: click-to-load, run in a sandboxed iframe. Never paste GitHub's `<script>` embed.
- Warren works in C#/.NET and TypeScript with Lit web components: prefer Lit for any interactive island.
- No inline `style` attributes in markup or posts (the page designs use them; don't copy those across). A repeated pattern gets an `hmd-` modifier in `bundle.css` (e.g. `hmd-section--flush-top`, `hmd-mt-8`, `hmd-lead`); a one-off goes in the file's scoped `<style>`. The only exception is passing a value into a CSS custom property, as `Logotype` does with `--hmd-logo-size`.
