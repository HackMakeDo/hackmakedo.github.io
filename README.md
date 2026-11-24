# hackmakedo.com

The website of Hack Make Do Limited: Warren Buckley, Umbraco freelancer and contractor. A static
[Astro](https://astro.build) site on GitHub Pages, behind Cloudflare, with the blog migrated from WordPress
(`blog.hackmakedo.com`) and two small Cloudflare Workers.

Rules and decisions for working on the site (design, copy, accessibility, embeds, clients) are in
[`CLAUDE.md`](CLAUDE.md). What's still to do is in [`TODO.md`](TODO.md).

## Getting started

Node 22.18 or later (the scripts run TypeScript directly).

```sh
npm install
npm run dev        # http://localhost:4321, with /styleguide/ (dev only)
npm run build      # into dist/, with every check below
npm run preview    # serve dist/
```

## Deploying

- **The site**: merging into `main` deploys it (`.github/workflows/deploy.yml`, GitHub Pages). Pull requests run
  Lighthouse CI on the main page types and must score 100 in every category.
- **The Workers**: deployed by hand with Wrangler (pinned in `package.json`). Sign in once per machine with
  `npx wrangler login`, then `npm run deploy:redirects` or `npm run deploy:markdown`. Each Worker's README says what it
  does, how to check it and how to undo it.

## Scripts

| Script | What it does |
| --- | --- |
| `dev` / `build` / `preview` | Astro. `build` first checks every video has a saved poster and runs `astro check`; afterwards it builds the Pagefind search index and checks every page has a Markdown copy |
| `video-posters` | Saves a poster image for each new video embed (run after adding a video to a post) |
| `check:links` | Checks external links in posts; `-- --write` swaps dead ones for Web Archive copies near the post's date |
| `check:umbraco-versions` | Compares `src/data/umbraco-versions.ts` with Umbraco's lifecycle page; `-- --write` updates it |
| `lighthouse`, `lighthouse:mobile`, `lighthouse:desktop` | Lighthouse CI on the main page types (needs a build). Configs in `lighthouse/` |
| `lighthouse:full` | Builds, then Lighthouse on every page, mobile and desktop (slow; also a manual workflow in GitHub Actions) |
| `redirects` | Checks the old-blog redirects against the map and `dist/`; `-- --live --targets` checks the live Worker and site; `-- --build-map` rebuilds the Worker's lookups from the CSV |
| `markdown` | Checks every page has a Markdown copy and tests the Markdown Worker against `dist/`; `-- --live` checks the live site |
| `deploy:redirects`, `deploy:markdown` | Deploy a Worker (`wrangler deploy`) |

## Folders

| Path | What's in it |
| --- | --- |
| `src/pages/` | One file or folder per page type; blog posts render through `blog/[slug]/` |
| `src/content/` | Content collections: `posts/` (Markdown), `testimonials/`, `clients/`, `timeline/`, `case-studies/`, `faqs/` |
| `src/components/` | One Astro component per design-system component (`hmd-` classes) |
| `src/elements/` | Lit custom elements for the interactive bits: video, gist and looping-clip embeds, carousel, marquee, timeline, search, copy button, contents |
| `src/styles/` | `tokens.css` and `bundle.css`, the site's only CSS, inlined into every page |
| `src/data/` | Data in TypeScript: projects, topics, published case studies, Umbraco versions |
| `src/lib/` | Build helpers: structured data, the Markdown copies, code-block and Markdown plugins |
| `public/` | Static files served as-is: images (blog images under `images/blog/<post>/`), fonts, `robots.txt`, `llms.txt` |
| `scripts/` | The check and maintenance scripts above |
| `cloudflare/` | The two Workers: `blog-redirects/` (the old blog, with its URL map CSV) and `markdown-negotiation/` |
| `lighthouse/` | Lighthouse CI configs and URL lists |
| `design-system/`, `page-designs/` | The design the site was built from: brand rules, tokens, component references, page mock-ups |
| `docs/` | Plans for later work |

## Common jobs

- **New blog post**: add `src/content/posts/<slug>.md` with `title`, `date`, `topics` (see `src/data/topics.ts`) and an
  `excerpt` of 120 to 160 characters saying what the reader will learn. Images go in `public/images/blog/<slug>/`.
- **Video in a post**: `<hmd-video class="hmd-video" provider="youtube|vimeo|ted" video-id="…" label="…">` with a
  fallback link inside (copy one from any post), then `npm run video-posters`.
- **Animated GIF**: convert it to a looping clip instead; the `ffmpeg` commands and markup are in `CLAUDE.md`.
- **GitHub gist**: `<hmd-gist class="hmd-gist" gist="user/id" label="…">` with a fallback link inside.
- **Publish a case study**: add its slug to `PUBLISHED_CASE_STUDIES` in `src/data/case-studies.ts` (see `TODO.md`).
- **New Umbraco release**: `npm run check:umbraco-versions -- --write`, then build. The upgrades page and its version
  table update from the data.
- **A missed old blog link**: add a row to `cloudflare/blog-redirects/blog-url-map.csv`, then
  `npm run redirects -- --build-map` and `npm run deploy:redirects`.
