# Launch checklist

Everything to write, decide, check and do before `site-redesign` goes live.

> **Merging this branch is the launch.** `main` is the current live site and
> `.github/workflows/deploy.yml` publishes to hackmakedo.com on every push to `main`.
> Content, redirects and checks must be finished before the PR merges, not after.

Tick items off as you go (`- [x]`). Search the repo for `Placeholder` to find every gap
still visible on the site.

---

## 1. Copy only you can write

### Hire pages

- [x] **Freelancer**: how a freelance engagement runs, one answer-first sentence (booked by the day, week or month;
      a "How do you charge?" FAQ added)
- [x] **Freelancer**: Availability: "Available now", linked to Contact. Update it when you're booked
- [x] **Freelancer FAQ**: which Umbraco versions you take on and how soon you can start
- [x] **Contractor FAQ**: current availability and how to book (same wording as the freelancer FAQ; keep it in step
      with the freelancer fact, freelancer FAQ and Contact FAQ when your availability changes)
- [x] **Contractor FAQ**: your IR35 position (outside preferred, inside considered at an adjusted rate)
- [x] **Contractor FAQ**: notice needed (usually within a week of agreeing the contract)

### Umbraco upgrades page and banner

- [x] **`/umbraco-upgrades/`**: copy read and approved by Warren (22 November 2026)
- [x] **Version table** (`src/data/umbraco-versions.ts`): matches Umbraco's lifecycle page exactly (checked 18 November 2026).
      Statuses update on each build. Before a deploy, run `npm run check:umbraco-versions` (and `-- --write` to pull in
      changes or new releases, such as Umbraco 19 on 10 December 2026 and the next LTS, Umbraco 21, on 9 December 2027)
- [ ] **Marquee banner** (`src/components/Marquee.astro`): on Home, under the hero. Change its copy once
      14 December 2026 has passed. (A pause is remembered across visits in localStorage; the privacy page explains it)

### About and contact

- [x] **About**: your bio in your own words (`src/pages/about/index.astro`)
- [x] **About FAQ**: whether you name your town, and where you will travel to (North Essex)
- [x] **About FAQ**: do you speak at events? (question dropped)
- [x] **Contact**: your usual reply time, in the lead (`src/pages/contact/index.astro:35`) and the FAQ (`:15`). Dropped: the lead and an availability FAQ replace it

### Privacy

- [x] Privacy notice wording: placeholders removed, hosting (GitHub Pages, Cloudflare) added. Updated 19 November 2026 for
      Vimeo, TED and GitHub Gist embeds and the remembered banner pause
- [x] How long you keep emails: "only as long as I need them … and to meet legal record-keeping duties"
- [x] Cloudflare Web Analytics: confirmed live, injected automatically by Cloudflare (no code needed); no cookies set

### Blog

- [x] **Post excerpts** for the 15 posts that get the most Google traffic (22 November 2026): drafted, checked against
      each post, and approved by Warren; the Swagger, Custom conditions and Getting Started dashboard excerpts rewritten
- [x] **Recent posts' excerpts** (2021 to 2025, nine posts; 22 November 2026): rewritten and approved, since they show on
      Home, the first blog page and in RSS
- [x] **The other 30 excerpts** (2013 to 2018; 22 November 2026): rewritten and approved, five at a time
- [x] **Every post read** (19 November 2026): headings and contents sidebars, typos, code indentation and long lines,
      image sizes, videos and gists embedded click-to-load, dead links swapped for Web Archive copies near each post's date
      (`npm run check:links` re-checks; `-- --write` applies the safe fixes)
- [x] **Two dead links with no archive copy**: the JWT post links `jwt-dotnet/jwt` (the moved repo); the Data-Peek
      Actions run sentence is removed
- [x] The `en_us.user.xml` sample in the IPasswordValidator post: the `<?xml ?>` declaration now comes first, so the
      copied file is valid XML (checked with `xmllint`)

---

## 2. Decisions

- [x] **Placeholder pages: ship or hold?** Held: every case study stays out of the launch and is published one at a time
      afterwards (see section 5). Cards link to GitHub, client cards show no link
- [x] **Client permission in writing** (20 November 2026): the Council of the European Union, including the upgrades
      page's "13 to 16" and "about 90% of the work"; Gibe Digital for Dyson, Tottenham Hotspur and Wolverhampton Wanderers,
      with Steve Temple's quote. Manifesto Digital asked that their client isn't named, only described: the card says
      "A global food safety standards body" (`src/content/clients/food-safety-standards-body.json`), with Pete Cooper's quote.
      Never write the client's name anywhere in this repo: it is public on GitHub
- [x] **Kind words**: added Morten Christensen and Bjarke Berg (Umbraco HQ) to the four client quotes; Simone and Morten shown full width
- [x] **`/styleguide/`**: left out of the production build (a hook in `astro.config.mjs` deletes it after the build);
      still available in `npm run dev`
- [x] **Timeline "Now" entry** wording (`src/content/timeline/2026-now.json`). Unchanged in your Timeline edits:
      "Tools that make developers' lives easier" / "Consulting through Hack Make Do and keeping a shelf of open source
      Umbraco packages and developer tools growing." Tick if you're happy with it
- [x] **Footer**: company number, registered office, VAT number and the four social links are correct
      (`src/components/SiteFooter.astro`). Columns settled: Hire, Work, About (Warren, Timeline, Recommendations),
      Writing, Elsewhere
- [x] **`public/llms.txt`**: "since about 2005" sits alongside "20 years building with Umbraco". Make them agree (now \"has built with Umbraco for 20 years\")
- [x] **Older MVP badges**: only 2026 carries Open Badges data. Umbraco doesn't publish badge classes for
      earlier years yet (`/badges/mvp/2025.json` etc. return 404). Ask Umbraco HQ whether past years will be issued

---

## 3. Checks

- [x] Read every page at phone and desktop width (22 November 2026; phone header, timeline and post spacing fixed along the way)
- [x] `npm run lighthouse:full`: 100 in every category on all 103 pages, mobile and desktop (20 November 2026)
- [x] Keyboard-only pass: skip link, visible 3px focus rings, carousel, timeline toggle, copy button (fixed: plain links had
      the browser's thin ring because the CSS minifier broke the focus rule)
- [x] Reduced motion on: timeline progress line shows full, nothing animates (banner, looping clips wait for play)
- [x] All 64 posts: code blocks, images, and the 19 posts with embeds (20 videos, 2 gists). Read through 19 November 2026
- [x] **Horizontal scroll on phones**: 13 posts and Kind words were wider than a 390px screen (long bare URLs,
      file-name headings, long title words). Fixed with `overflow-wrap` on prose and post headers, and page titles
      that scale with the viewport on phones. Every page now fits 390px (`/styleguide/` still overflows, but it no longer ships)
- [x] Link checker across the whole built site (internal and external links), 20 November 2026
- [x] Testimonials match LinkedIn word for word, and each links to the right profile (checked 18 November 2026)
- [x] Structured data: every page's JSON-LD parses, Articles carry headline, dates, author and image (Google's own
      Rich Results Test needs the live URLs: run it after launch)
- [x] Every indexable page has a 1200×630 Open Graph image, title and description
- [x] RSS (`/blog/rss.xml`), sitemap, `robots.txt`, `llms.txt` and the `.md` copies all load and read correctly
- [x] 404 search works with JavaScript (Pagefind) and without (site-limited web search); results are announced
- [x] Nothing third-party loads with the page. Fixed 19 November 2026: YouTube thumbnails were loading from `i.ytimg.com` on
      every view; all video posters are now self-hosted (`npm run video-posters`, enforced by `npm run build`). Gists load
      from GitHub only on "Show code", in a sandboxed frame
- [ ] **Instagram:** the Reel in "Why I have still stuck around…" won't embed (Instagram reports it as broken). It's a link
      for now. To embed it, turn on embeds for your account (Instagram › Settings › Sharing and reuse) or upload the video to
      YouTube or Vimeo

---

## 4. Launch mechanics

- [x] Commit the Button/Chip refactor, `.agents/`, `.claude/skills/` and `skills-lock.json` (`ae49c52`, `c2ba381`)
- [x] **Redirects**: `content/blog-url-map.csv` (471 old URLs, rules R01–R13) is served by a Cloudflare Worker,
      `cloudflare/blog-redirects/` (19 November 2026). `npm run redirects` checks every old URL lands where the map says
      and every target exists in `dist/`
  - [x] Fixed the 115 targets that didn't exist (`/blog/tag/` to `/blog/topic/`, the "my development setup" slug, and the
        media files, matched to their new paths; `2023/10/image.png` matched byte for byte)
  - [x] A Worker rather than Bulk Redirects (Warren's decision, 21 November 2026): it handles the 64 `?p=` short links, URLs the map never listed (other
        comment and tag pages, WordPress query strings) and sends anything unknown to `/blog/` instead of a 404
  - [ ] **On launch day, after the merge deploys:** deploy the Worker and run the live check. Steps in
        `cloudflare/blog-redirects/README.md` (you sign in to Cloudflare; it takes over `blog.hackmakedo.com`)
- [x] Old site files (`main`): its two pages, `/` and `/timeline/`, exist on the new site. Kept at their old paths:
      `/images/hack-make-do-logo-sq.png` (the old share image, cached in past link previews), `/images/warren_square.jpg`
      (an avatar hotlinked from other services), `/audio/drumroll.mp3`, and `/sitemap.xml` (a copy of the sitemap index,
      made at build in `astro.config.mjs`, in case Search Console still has the old address). The old CSS, scripts and
      background shapes were only used by the old pages; the MVP badges moved to `/images/mvp/`
- [x] **Markdown for agents** (22 November 2026): every page has a Markdown copy (`<page>/index.html.md`), linked from
      its `<head>`; a Worker, `cloudflare/markdown-negotiation/`, serves it for `Accept: text/markdown` (Cloudflare's own
      switch needs Pro). `npm run markdown` checks it after every build
  - [ ] **On launch day, after the merge deploys:** deploy it and run `npm run markdown -- --live`. Steps in
        `cloudflare/markdown-negotiation/README.md`. Set the Worker to fail open
- [x] **Cloudflare AI crawler settings** (22 November 2026): Bot Fight Mode and AI Labyrinth off, all four "AI Crawler and
      Agent access policies" set to Allow, and no managed robots.txt (the live file is served unchanged). GPTBot,
      ClaudeBot, PerplexityBot and CCBot all get 200. After launch, check `https://hackmakedo.com/robots.txt` matches
      `public/robots.txt`
- [x] **Cloudflare: Email Address Obfuscation off** (22 November 2026; the live site no longer loads `email-decode.min.js`)
- [x] **DNSSEC on** (22 November 2026): Cloudflare signs the zone and the DS record is at the `.com` registry
- [x] **Workers uploaded without routes** (23 November 2026): `hackmakedo-blog-redirects` and
      `hackmakedo-markdown-negotiation` are in the Cloudflare account but handle no traffic. Wrangler is signed in on
      this machine. On launch day, `npm run deploy:redirects` and `npm run deploy:markdown` add the routes; then set
      each route to **Fail open** in the dashboard
- [ ] **Push a squashed branch, not `site-redesign`.** Its earlier commits name Manifesto's client, and the repo is
      public. From an up-to-date `main`: `git switch -c launch main && git merge --squash site-redesign && git commit`,
      then push `launch` and open the PR from it. Never push `site-redesign` itself
- [ ] Open the PR from `launch` to `main`; Lighthouse CI must pass
- [ ] Merge (this deploys)
- [ ] Run the redirect test against the live site (`npm run deploy:redirects`, then `npm run redirects -- --live --targets`)
- [ ] Search Console: Change of address from the `blog.hackmakedo.com` property to `hackmakedo.com`, then submit
      `https://hackmakedo.com/sitemap-index.xml` to Google Search Console and Bing Webmaster Tools
- [ ] Watch for 404s for the first couple of weeks

---

## After launch: Umbraco versions on blog posts

- [ ] Tag every Umbraco post with the versions it works on, show an automatic "written for / out of date" notice,
      verify each post against Umbraco's source in batches of five, and add "Updating for Umbraco 17" sections where
      the technique still holds but the code changed. Plan, tools and the three posts already verified:
      `POST-LAUNCH-UMBRACO-VERSIONS.md`

## 5. After launch: case studies

Every case study is held back from the live site. Each page still builds in `npm run dev`, so you can write and preview it
at its `/work/<slug>/` URL. To publish one, finish its copy and add its slug to `PUBLISHED_CASE_STUDIES` in
`src/data/case-studies.ts`: the page, its share image, its sitemap entry and every card link switch on together.
Then add the page back to `lighthouse-urls.cjs` (the Council page, ContentLock and one project page cover the templates),
and for ContentLock, the "Read the case study" link on its timeline entry (`src/content/timeline/2025-contentlock.json`).

### Client case studies (Council first, once it approves the result and screenshot)

- [ ] **Council of the EU**: your Role and Engagement (contract, outside IR35; don't name the company that paid you)
      (`src/content/clients/council-of-the-european-union.json` and
      `src/pages/work/council-of-the-european-union/index.astro:38-39`)
- [ ] **Council of the EU**: the problem paragraph: why 13 to 16, what made it hard (`:51`)
- [ ] **Council of the EU**: specifics for the two "what I did" points (`:74`, `:78`) and a third point (`:80`)
- [ ] **Council of the EU**: a shareable result, approved by the Council (`:87`)
- [ ] **Council of the EU**: a screenshot, only with the Council's permission (`:61-62`)
- [ ] **Food safety standards body (via Manifesto)**: what you built and what it achieved, without naming the client
      (`src/content/clients/food-safety-standards-body.json` summary)
- [ ] **Gibe Digital clients**: what you built and what it achieved (`src/content/clients/gibe-digital-clients.json` summary)
- [ ] **Manifesto and Gibe client pages** (`src/pages/work/[client]/index.astro`): scope, role, the challenge,
      two things you did, a result approved by the agency, a screenshot (or decide these pages don't ship yet, see section 2)

### Project card screenshots (optional)

- [ ] The project cards launch text-only. To add screenshots: 16:10, captured around 1600 × 1000 from a demo site with the
      same browser width and backoffice theme, cropped tight to the feature, saved to `src/assets/projects/`. Do a whole
      grid at once (Home needs ContentLock, Compact Log Format Viewer and IIS Express Code), never some cards only

### Project case studies

- [ ] **ContentLock**: the problem story, two or three paragraphs (`src/pages/work/contentlock/index.astro:80`)
- [ ] **ContentLock**: hero screenshot, which is also its Open Graph image (`:53`)
- [ ] **Each project in `src/data/projects.ts`** needs a problem story, two or more features, a screenshot
      and a "First released" date (`src/pages/work/[project]/index.astro:75, 84, 108, 116-117`):
  - [ ] Examine Peek
  - [ ] Manifest Peek
  - [ ] User 2FA
  - [ ] Iconoir Icon Pack
  - [ ] Our Umbraco TagHelpers
  - [ ] Compact Log Format Viewer (also "Built with" is `Placeholder`, `projects.ts:80`)
  - [ ] IIS Express Code

---

## Done

- [x] 2026 MVP badge replaced with the official one carrying Open Badges v2 data (checked 18 November 2026:
      the embedded assertion matches the hosted one, the badge class is "Umbraco MVP 2026", issued by
      Umbraco Community, recipient `community.umbraco.com/p/warrenbuckley`, issued 1 June 2026, expires 1 July 2027)
