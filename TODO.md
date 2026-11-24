# To do

What's still open now the site is live (launched 24 November 2026). Tick items off (`- [x]`) or delete them when done;
git keeps the history, including the launch checklist this replaced.

## Launch follow-ups

- [x] Cloudflare: set both Worker routes to **Fail open** (Workers & Pages › each Worker › Settings › Domains & Routes).
      Wrangler can't set this
- [x] Google Search Console: in the `blog.hackmakedo.com` property, **Change of address** to `hackmakedo.com`; submit
      `https://hackmakedo.com/sitemap-index.xml` in the `hackmakedo.com` property
- [x] Bing Webmaster Tools: add the site and submit the same sitemap
- [ ] Cloudflare: turn on **Crawler Hints** (hackmakedo.com › Caching › Configuration › Crawler Hints). It tells Bing and
      other IndexNow search engines when a page changes, so updates are recrawled sooner (Bing also feeds ChatGPT search).
      Off as of 24 November 2026, and the API refuses to change it ("Method not allowed for this authentication scheme"):
      dashboard only
- [ ] Google's Rich Results Test on a few live pages (Home, About, a post, the upgrades page)
- [x] Re-run the scan at isitagentready.com (level 3; all applicable checks pass)
- [x] `www.hackmakedo.com` redirects to `hackmakedo.com` (proxied CNAME plus a Redirect Rule)
- [ ] Cloudflare: turn off **JavaScript detections** (`enable_js`). It adds `/cdn-cgi/challenge-platform/…` to every
      page and costs live Lighthouse Best Practices points (deprecated APIs). Not in the dashboard on the Free plan: set it with the API
      (`PUT /zones/{zone}/bot_management` with `{"enable_js": false}`). Bot fight mode is already off
- [ ] Watch for 404s in Search Console and Cloudflare for a couple of weeks; a missed old link goes in
      `cloudflare/blog-redirects/blog-url-map.csv`, then `npm run redirects -- --build-map` and `npm run deploy:redirects`
- [ ] After a few quiet weeks, cancel the WordPress.com plan. Keep the `blog` DNS record and the redirect Worker for good

## Dated

- [ ] **10 December 2026**: Umbraco 19 is released. `npm run check:umbraco-versions -- --write`, then build and deploy
- [ ] **After 14 December 2026**: Umbraco 13 reaches end of life. Change the home page banner copy
      (`src/components/Marquee.astro`) and reread `/umbraco-upgrades/`

## Search and AI visibility

Research and the full plan are in Claude's project memory (`post-launch-seo-aeo-plan`). In short, in order:

- [ ] Profiles say the same thing ("Umbraco freelancer and contractor · Hack Make Do · hackmakedo.com"): LinkedIn,
      GitHub, Sessionize (still says Developer Advocate), Polywork, our.umbraco.com, YouTube, Mastodon, X, NuGet and
      Marketplace. Not the Umbraco community profile until Umbraco makes profiles public
- [ ] Publish the Council of the EU case study (below) and write an "Upgrading Umbraco 13 to 17" guide
- [ ] Link to hackmakedo.com from package READMEs, NuGet and Marketplace listings
- [ ] Measure monthly: Search Console and Bing queries; ask ChatGPT, Perplexity and Claude who's a good Umbraco
      contractor in the UK

## Blog posts: Umbraco versions

- [ ] Tag every Umbraco post with the versions it works on, show an automatic "written for / out of date" notice,
      verify each post against Umbraco's source in batches of five, and add "Updating for Umbraco 17" sections where the
      technique still holds. Plan, tools and the three posts already verified: `docs/umbraco-versions-plan.md`

## Case studies

Every case study is held back from the live site. Each page still builds in `npm run dev`, so it can be written and
previewed at its `/work/<slug>/` URL. To publish one, finish its copy and add its slug to `PUBLISHED_CASE_STUDIES` in
`src/data/case-studies.ts`: the page, its share image, its sitemap entry and every card link switch on together. Then add
the page to `lighthouse/lighthouse-urls.cjs` (the Council page, ContentLock and one project page cover the templates),
and for ContentLock, the "Read the case study" link on its timeline entry (`src/content/timeline/2025-contentlock.json`).

### Clients (Council first; permission confirmed 20 November 2026)

- [ ] **Council of the EU**: role and engagement (contract, outside IR35; don't name the company that paid you)
      (`src/content/clients/council-of-the-european-union.json`, `src/pages/work/council-of-the-european-union/index.astro`)
- [ ] **Council of the EU**: the problem paragraph (why 13 to 16, what made it hard), specifics for the "what I did"
      points plus a third, a shareable result approved by the Council, a screenshot only with their permission
- [ ] **Food safety standards body (via Manifesto)**: what you built and what it achieved. **Never name the client**
      (`src/content/clients/food-safety-standards-body.json`)
- [ ] **Gibe Digital clients**: what you built and what it achieved (`src/content/clients/gibe-digital-clients.json`)
- [ ] **Manifesto and Gibe client pages** (`src/pages/work/[client]/index.astro`): scope, role, the challenge, two
      things you did, a result approved by the agency, a screenshot, or decide these pages stay unpublished

### Projects

- [ ] **ContentLock**: the problem story (two or three paragraphs) and a hero screenshot, which is also its share image
      (`src/pages/work/contentlock/index.astro`)
- [ ] **Each project in `src/data/projects.ts`**: a problem story, two or more features, a screenshot and a
      "First released" date (`src/pages/work/[project]/index.astro`): Examine Peek, Manifest Peek, User 2FA, Iconoir
      Icon Pack, Our Umbraco TagHelpers, Compact Log Format Viewer (its "Built with" is `Placeholder` in
      `projects.ts`), IIS Express Code
- [ ] Optional: project card screenshots, 16:10, about 1600 × 1000 from a demo site with the same browser width and
      backoffice theme, cropped to the feature, in `src/assets/projects/`. Do a whole grid at once (Home needs
      ContentLock, Compact Log Format Viewer and IIS Express Code), never some cards only

## Optional

- [ ] Instagram Reel in "Why I have still stuck around…": turn on embeds for the account (Instagram › Settings ›
      Sharing and reuse) or upload the clip to YouTube or Vimeo, then embed it
