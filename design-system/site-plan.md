# Site plan

The plan for rebuilding hackmakedo.com so that Warren is found, and hired, as an **Umbraco freelancer** and **Umbraco contractor**, by people searching on Google and Bing and by people asking AI assistants. **Decide** marks the choices still open.

## Goal and audience

- **Agencies and in-house teams needing a contractor:** they search "Umbraco contractor", "Umbraco contract developer UK" or ask an assistant "who are good Umbraco contractors in the UK". They want availability, day-rate engagement, IR35 position and proof.
- **Businesses needing a freelancer for a project:** they search "Umbraco freelancer" or "freelance Umbraco developer". They want scope, process and proof: case studies and testimonials.
- **Developers** who arrive via a post or a package, then discover the person behind it.

## Search targets

| Phrase | Owner page | Notes |
| --- | --- | --- |
| Umbraco freelancer, freelance Umbraco developer | `/umbraco-freelancer/` | Primary. Project work. |
| Umbraco contractor, Umbraco contract developer | `/umbraco-contractor/` | Primary. Day-rate, joining teams, IR35. |
| Umbraco freelancer UK, Umbraco contractor UK | both, plus Home | UK in the title tag and copy; `areaServed` in structured data. |
| Umbraco MVP, Umbraco consultant | Home, About | Supporting. |
| Umbraco backoffice extension developer, Bellissima | Work, case studies, posts | Long tail. |
| Package and topic phrases (Umbraco content locking, Serilog log viewer, IIS Express VS Code) | Each case study and post | Long tail, brings developers. |

Two hire pages, not one: the two phrases carry different intent, so each page earns its place with different content (freelancer: scope, process, case studies; contractor: availability, how engagements work, IR35, team fit). Each links to the other. Never publish two near-identical pages.

**Titles** (under 60 characters):

- Home: `Warren Buckley, Umbraco Freelancer & Contractor | Hack Make Do`
- `/umbraco-freelancer/`: `Umbraco Freelancer: Warren Buckley, 9× Umbraco MVP`
- `/umbraco-contractor/`: `Umbraco Contractor (UK): Warren Buckley, Umbraco MVP`
- Case study: `ContentLock: Umbraco Content Locking Package | Warren Buckley`
- Post: `<Post title> | Hack Make Do`

**On-page rules:** one `h1` per page containing the page's phrase; an answer-first lead (PageHeader) naming the phrase; the phrase in at least one `h2`; a hand-written meta description under 160 characters; descriptive internal link text ("Umbraco contractor" rather than "click here").

## Page map

| Page | Path | Components |
| --- | --- | --- |
| Home | `/` | SkipLink, SiteHeader (overlay), Hero + Backdrop (sprinkles), Credentials, ServiceCard grid, ProjectCard grid, Testimonial ×2, BioCard (short), BlogPostCard ×3, HireBanner, SiteFooter |
| Umbraco freelancer | `/umbraco-freelancer/` | PageHeader, Prose, ServiceCard, FeatureList (how I work), ProjectCard ×3, Testimonial, FAQ, ContactCard |
| Umbraco contractor | `/umbraco-contractor/` | PageHeader, Prose, FeatureList (how an engagement works), Credentials, Testimonial, FAQ (availability, IR35, notice, remote/on-site), ContactCard |
| About | `/about/` | PageHeader, BioCard (long), Prose, Credentials, Testimonial, FAQ, HireBanner |
| Work | `/work/` | PageHeader, ProjectCard grid, HireBanner |
| Case study | `/work/<slug>/` | PageHeader, ProjectFacts, Figure, Prose (why I built it), FeatureList (what makes it good), Figure gallery, CodeBlock, VideoEmbed, BlogPostCard (related), HireBanner |
| Blog index | `/blog/`, `/blog/page/<n>/`, `/blog/tag/<tag>/` | PageHeader, BlogPostCard grid, Chip (tags), Pagination |
| Post | `/blog/<slug>/` | PostHeader, Callout (archive), TableOfContents, Prose, CodeBlock, VideoEmbed, BlogPostCard (related), HireBanner |
| Timeline | `/timeline/` | Exists. Backdrop (WebGL), FilterBar, TimelineEntry, HireBanner. Link project entries to case studies. |
| Testimonials | `/kind-words/` | PageHeader, Testimonial grid (every LinkedIn recommendation, verbatim), HireBanner |
| Contact | `/contact/` | PageHeader, ContactCard, FAQ |
| Not found | `/404.html` | PageHeader ("That page has moved"), links to Work, Blog, search of posts |

**Client work comes first.** The Council of the European Union is the biggest client so far, and a named EU institution is the strongest single proof for both hiring managers and AI assistants. Give it its own case study at `/work/council-of-the-european-union/` (the problem, Warren's role, the Umbraco work, the outcome), a line in Credentials on Home and both hire pages, and a mention in `llms.txt`. Always write the full name, "Council of the European Union" (it is a different body from the European Council). Confirm the contract allows naming it before launch; if not, say "a European Union institution" and keep the specifics.

Case studies, first wave: the Council of the European Union project, ContentLock, Compact Log Format Viewer, IIS Express Code. Second wave: Examine Peek, Manifest Peek, User 2FA, Iconoir Icon Pack, Our Umbraco TagHelpers, the `dotnet new umbraco-extension` template work.

Case study outline: what it is (one line) · why I built it · what makes it good (FeatureList) · screenshots · how it works (the interesting technical decisions) · install and links · related posts · "Need something like this built for your Umbraco site?" linking to the freelancer page.

## Ready for AI search (GEO)

AI assistants (ChatGPT, Claude, Perplexity, Gemini, Copilot) answer "who is a good Umbraco contractor?" by searching the web and quoting pages they can read and trust. What gets a site quoted is mostly ordinary good SEO plus a few specifics:

1. **Let the crawlers in.** Allow the search and user-fetch bots: `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`. The training bots (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`) are allowed too (decided 4 November 2026): being in a model's training data is how it "knows" Umbraco freelancers without searching. Blocking `Google-Extended` does not affect Google Search.
2. **Check Cloudflare.** The domain uses Cloudflare. Check Security › Bots (AI crawler blocking, Bot Fight Mode) and any managed robots.txt, which can block AI crawlers regardless of your own robots.txt. Turn off Scrape Shield's Email Address Obfuscation so the address is readable text.
3. **Publish llms.txt** at `/llms.txt` (draft below): a Markdown file with an H1, a one-paragraph summary and links to the pages that matter. It is an emerging convention, not a ranking factor; Google's representatives have said Search does not need it, but Chrome Lighthouse added an agent-readiness audit for it in May 2026, and it costs nothing on a static site. Also publish Markdown copies of key pages (`/umbraco-contractor/index.html.md`), which Astro can generate at build time.
4. **Be one consistent entity.** Use the same name and descriptor everywhere: "Warren Buckley, freelance Umbraco developer and contractor (Hack Make Do), nine-time Umbraco MVP". Do this on the site, LinkedIn headline, GitHub bio, Umbraco community profile, Mastodon, YouTube and the Umbraco Marketplace author page, all linking to hackmakedo.com. Assistants cross-check these.
5. **Structured data** (JSON-LD, one `@graph`, extending the `Person` already on the timeline page):
   - `Person` (`@id` `https://hackmakedo.com/#person`): `jobTitle` "Freelance Umbraco Developer and Contractor", `knowsAbout` (Umbraco, .NET, C#, TypeScript, Lit, SignalR), `award` (each Umbraco MVP year), `sameAs` (all profiles), `worksFor` the organisation.
   - `Organization` / `ProfessionalService` for Hack Make Do Limited: `founder`, `areaServed` GB, `vatID`, `address` (registered office), and `makesOffer` with two `Service` items, "Umbraco freelance development" and "Umbraco contract development".
   - `Article` on posts (author is the Person `@id`), `SoftwareSourceCode` on case studies, `BreadcrumbList` everywhere, `FAQPage` on hire pages.
   - Never mark up testimonials as `Review` or `AggregateRating`.
6. **Write answer-first.** Every page and `h2` section starts with the direct answer; FAQs use the questions clients actually ask. Show dates ("Updated November 2026") on hire pages and posts, and keep the availability line current.
7. **Bing matters.** Several assistants lean on Bing's index. Verify hackmakedo.com in Bing Webmaster Tools (the blog is already verified), submit the sitemap and turn on IndexNow so new posts are picked up within hours.
8. **Earn mentions elsewhere.** Links and mentions from umbraco.com (the MVP list, Marketplace), Skrift, Codegarden talks, podcasts and community blogs are what both Google and assistants treat as evidence. Ask that they link to the hire pages, not just GitHub.

### Draft `/llms.txt`

```markdown
# Hack Make Do

> Hack Make Do is the company of Warren Buckley, a UK-based freelance Umbraco developer and Umbraco contractor, and a nine-time Umbraco MVP. He builds Umbraco CMS sites, backoffice extensions and developer tooling, and is available for freelance projects and contract work.

Warren has worked with Umbraco since about 2005, including roles at Umbraco HQ on the CMS core team and as a developer advocate. Clients include the Council of the European Union. He maintains open source Umbraco packages including ContentLock, Examine Peek and Manifest Peek, and the Compact Log Format Viewer for Serilog log files. Contact: warren@hackmakedo.com

## Hire

- [Umbraco freelancer](https://hackmakedo.com/umbraco-freelancer/): Freelance Umbraco development for projects, upgrades and backoffice extensions
- [Umbraco contractor](https://hackmakedo.com/umbraco-contractor/): Contract Umbraco development with agency and in-house teams in the UK
- [About Warren Buckley](https://hackmakedo.com/about/): Background, MVP awards and how he works
- [Career timeline](https://hackmakedo.com/timeline/): Twenty years of Umbraco roles, awards and projects

## Work

- [ContentLock](https://hackmakedo.com/work/contentlock/): Umbraco package that lets editors lock content nodes, with live presence via SignalR
- [Compact Log Format Viewer](https://hackmakedo.com/work/compact-log-format-viewer/): Cross-platform desktop app for querying Serilog JSON log files
- [IIS Express Code](https://hackmakedo.com/work/iis-express-code/): VS Code extension that runs a folder as a website with IIS Express

## Writing

- [Blog](https://hackmakedo.com/blog/): Umbraco, Bellissima and .NET tutorials

## Optional

- [GitHub](https://github.com/warrenbuckley)
- [LinkedIn](https://www.linkedin.com/in/warrenbuckley/)
- [YouTube](https://www.youtube.com/@WarrenBuckley)
```

### Draft `/robots.txt`

```text
User-agent: *
Allow: /

# AI search and user-requested fetches: allowed
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
Allow: /

Sitemap: https://hackmakedo.com/sitemap-index.xml
```

Training crawlers (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`) are allowed by the `User-agent: *` group; no `Disallow` groups are needed.

## Technical SEO

- Static HTML, sitemap, robots.txt, canonical URLs, trailing slashes throughout, Open Graph and Twitter images per page.
- **Goal: 100 in PageSpeed Insights on mobile and desktop, for every template** (Home, hire pages, a case study, a post, the blog index, the timeline). The budget that gets there:
    - **HTML first, no framework runtime.** Static HTML; JavaScript only for islands that need it (`hmd-copy`, `hmd-video`, FilterBar, the backdrop canvas), each loaded `type="module"` and deferred.
    - **CSS inline.** `tokens.css` + `bundle.css` (about 30 KB unminified) are inlined into each page's `<head>`, minified; no render-blocking stylesheet requests.
    - **Fonts self-hosted, subset, preloaded.** Convert the 394 KB Montserrat variable TTF to a Latin-subset WOFF2 (roughly a tenth of the size); self-host Source Sans 3 the same way; preload only the display face used above the fold; `font-display: swap` with metric-matched fallbacks (`size-adjust`, `ascent-override`) so the swap causes no layout shift. No Google Fonts requests.
    - **Largest Contentful Paint = text.** The Home LCP is the Logotype's HTML text and inline SVG, so it paints with the first response. Hero images, if any, are AVIF with `fetchpriority="high"`.
    - **Backdrops never block.** The sprinkles SVG is a small CSS background. The WebGL contour field starts only after load (`requestIdleCallback`), skips under `prefers-reduced-motion` and on low-power devices, and replaces three.js r128 (about 600 KB) with a small hand-written WebGL shader or a 2D canvas. This is the timeline page's biggest score risk today.
    - **Images:** AVIF/WebP via Astro's image pipeline, explicit `width`/`height`, `loading="lazy"` below the fold, `decoding="async"`.
    - **Third parties:** none on page load. YouTube loads on click (VideoEmbed). Cloudflare Web Analytics' beacon is small and deferred; keep it, or switch to Cloudflare's server-side analytics for zero client script.
    - **Layout stability:** every image, embed and canvas has reserved space (`aspect-ratio`); no injected banners.
    - **Accessibility, Best Practices and SEO also at 100:** contrast already passes; check labels, `lang`, meta descriptions and the agentic browsing audits (llms.txt) in CI.
    - **Guard it in CI:** run Lighthouse CI on every pull request against the six templates, failing the build below 100 on any category.
- Move the Search Console and Bing verification tags from the blog to the main site.
- Cloudflare Insights is already on; keep it.

## Privacy and cookies (UK GDPR and PECR)

- **No cookie banner.** The site sets no cookies and stores nothing on visitors' devices when a page loads. Cloudflare Web Analytics is cookieless (no cookies, local storage or identifiers), fonts are self-hosted so no visitor IPs go to Google, and YouTube loads only when someone clicks play, with a notice on the button.
- **Keep it that way.** Anything that stores data on a device (a theme toggle in `localStorage`, an embed, a chat widget, a newsletter form) needs checking against PECR before it ships. A theme preference falls under the ICO's "appearance" exception, provided the privacy notice explains it and there's an easy way to clear it. Advertising or cross-site tracking always needs consent.
- **A privacy notice is still required.** UK GDPR covers the personal data the site does handle: IP addresses processed by Cloudflare and GitHub Pages in transit, enquiry emails, and anything YouTube collects after a click. Name Hack Make Do Limited as controller, list those, and give a contact.
- **ICO fee.** Check Hack Make Do Limited pays the ICO data protection fee (most businesses that handle personal data must).
- Re-check when the law moves: the ICO finalised its storage and access technologies guidance in 2026, after the Data (Use and Access) Act 2025 added exceptions for analytics and appearance.

## Blog migration

Source: blog.hackmakedo.com on WordPress.com, about 32 pages of posts from July 2013 to April 2025, categories Tech, Umbraco and Personal.

1. Export from WordPress.com (Tools › Export) and convert to Markdown with front matter (title, date, categories, tags, slug), downloading all images into the repo.
2. New URL shape (decided): `/blog/<slug>/`, no date. Posts tied to a point in time put the year in the slug instead, so a later post on the same subject gets its own URL: `my-development-setup-whats-yours` becomes `/blog/my-development-setup-2014/`. Each renamed post needs its own Cloudflare redirect rule placed before the wildcard rule. WordPress slugs are unique, the date stays on the page and in `Article` structured data, and a Cloudflare wildcard rule maps `/<yyyy>/<mm>/<dd>/<slug>/` to it. Full redirect map (categories, tags, paging, feeds, `?p=` shortlinks, attachments) is in the sitemap and content plan doc.
3. Fix by hand: code fences with languages, YouTube embeds to VideoEmbed, internal links, and an archive Callout on posts for old Umbraco versions.
4. Redirect with Cloudflare Redirect Rules (301, wildcard patterns): posts `/*/*/*/*` to `hackmakedo.com/blog/${4}/`, plus rules for tags, categories, paging, feeds, `?p=` shortlinks and a catch-all to `/blog/`. Confirm the zone is on Cloudflare first; GitHub Pages cannot send 301s itself. Test every inventoried URL for a single 301 to a 200, and keep the rules for at least a year.
5. Publish `/blog/rss.xml` with the same title. Subscribers (decided): no import. Before the redirects go live, publish a "the blog has moved" post on WordPress.com, which emails the 24 confirmed subscribers and reaches Reader followers, linking to the new RSS feed and the hire pages. The other 149 exported rows (unconfirmed, mostly bot sign-ups; bounced; paused; unsubscribed) are left behind.
6. Comments (decided): no new comments. The 250 existing comments become a static, read-only archive under each post (name, date, text; no emails or avatars), built from the WordPress export. Each post ends with "Questions? Reply on Mastodon or email me". The privacy notice says how a commenter can ask for an old comment to be removed.
7. Retire WordPress.com only after the top 20 posts' redirects are verified.

## Build approach (GitHub Pages)

- **Decided:** Astro with static output. Content collections for posts and case studies, built-in sitemap and image optimisation, TypeScript throughout, and Lit components as islands (FilterBar, the WebGL backdrop). Eleventy is the lighter alternative.
- Deploy with GitHub Actions to Pages; keep the `CNAME` file.
- Ship `tokens.css`, `components/bundle.css` and `components/bundle.js` as the design layer; port `hmd-copy` and `hmd-video` to Lit if preferred.
- Generate `llms.txt`, the `.md` page copies, JSON-LD, sitemap and RSS at build time from the same content.

## Open items

- Council of the European Union: confirm it can be named publicly, whether it was direct or through an agency, and what you built, for the case study.
- Answers for the contractor FAQ: availability, IR35 position, remote or on-site, notice period (to do later).
- Testimonials: four are in place (Ceri Broussine, Pete Cooper, Simone Chiaretta, Cornelia Vasile). Add the rest from LinkedIn for the Kind words page.
- Screenshots and a few sentences on why each of the first three projects exists.
- Warren's bio in his own words (the facts are on the timeline).
- Other posts that may want a year in the slug: `thanks` (2014), `its-good-to-be-back` (2013), `time-to-say-goodbye-for-now` (2015).
