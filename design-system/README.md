Brand book for Warren Buckley's freelance Umbraco business, Hack Make Do, at hackmakedo.com. It exists so the rebuilt site (home, hire, about, work, case studies, blog, timeline, contact) looks like one thing. The values come from the live site's `styles.css` and `timeline.css`; nothing here is invented.

## Content fundamentals

- Write in first person, as Warren. Short, warm, practical. Real lines from the site: "Hacker, Maker, Do'er", "I ❤️ to improve the Umbraco DX (Developer Experience) journey", "Available for hire". Blog posts open "Hello 👋" or "Howdy" and close "Until next time, Happy Hacking 😀".
- Emoji are part of his voice: one or two per page, at a greeting, a sign-off or in a tagline. Never as bullets, card icons or decoration.
- UK English: organisation, colour, optimise.
- The company is written as three words, **Hack Make Do**, never "HackMakeDo". The domain is hackmakedo.com. The legal name is Hack Make Do Limited.
- Say what he is in the words people search: **Umbraco freelancer**, **Umbraco contractor**, freelance Umbraco developer. Use them naturally in titles, the hero line, page leads and headings; never stuff them.
- Answer first. Every page and every `h2` section opens with a plain sentence that states the fact ("Warren Buckley is a UK-based Umbraco contractor and nine-time Umbraco MVP."). That sentence is what Google snippets and AI assistants quote.
- Lead with what a client gets, then the proof. Keep the MVP count current: nine as of the 2026 award.
- Name technology precisely: Umbraco, Bellissima for the rebuilt backoffice, .NET, C#, TypeScript, Lit web components, SignalR.
- Never invent a testimonial, client, statistic, rate, availability date or screenshot. Placeholders say "Placeholder" in plain words.

## Visual foundations

- **Ground.** Pages sit on `ground` (Night navy `#0b1c2f`). Text is `ink`, secondary text `ink-muted`. Cards, quotes and code sit on `panel`. Use the `light` theme (Paper) for long blog posts and print: set `data-theme="light"` on the article.
- **Pink is a fill.** `pink` is the Make box, the SectionHeading box, primary buttons, the ServiceCard number and award markers. Text on pink is `on-pink`. As a text colour use `accent-text` (pink on Night, brick red on Paper).
- **The knockout.** In the Logotype the word Make is cut out of the pink box with an SVG mask, so whatever is behind (ground, sprinkles, the timeline's WebGL canvas) shows through the letters. `logo-cutout` decides what fills the hole: transparent on Night, navy on Paper. Anything showing through must stay dark (relative luminance 0.15 or less) to keep 3:1 against pink.
- **Backdrops.** Sprinkles (`--hmd-sprinkles-image`, 656px tile, `sprinkle` at 20%) on the Home hero; the WebGL contour field on the Timeline. One backdrop per page, always `aria-hidden`, always dark under text. Content pages stay flat.
- **Type.** Montserrat for display, headings, buttons, labels and navigation (800 logotype and page titles, 700 h2, 600 h3). Source Sans 3 for body. A mono stack for code. Body copy in `body`, leads in `body-lg`, dates in `small`. Use weights 400, 600, 700 and 800 only.
- **Layout.** `container-wide` (1200px) for the page, `container-text` (720px) for reading. Sections pad `space-24` (desktop), `space-16` (tablet), `space-12` (phone). Gutters `space-6`, `space-4` on phones. Grids gap `space-8`.
- **Shape.** Brand signatures are square (`radius-none`): the Make box, heading boxes, service numbers. Controls are pills (`radius-pill`). Cards and quotes `radius-lg`; code, screenshots and callouts `radius-md`. Portrait `radius-round`.
- **Motion.** Colour changes 0.2s ease-in-out. Sprinkles drift slowly; the timeline field animates. Everything stops under `prefers-reduced-motion`. No parallax, no autoplaying video.
- **Focus.** Every interactive element shows a solid 3px `focus-ring` outline offset by 3px.
- **Borders and shadows.** Hairlines in `rule` (decorative only). Control outlines in `border-strong`. A hovered card gains `shadow-panel`; nothing rests on a shadow.
- **Performance.** The site targets 100 in PageSpeed Insights. Inline the CSS, self-host fonts as subset WOFF2, keep text as the largest paint, start any canvas after load, reserve space for every image and embed, and load nothing from third parties until someone asks for it. A component that costs score does not ship.
- **Do not** add gradients, glassmorphism, left-border accent cards, stock photography, icon sets or mascots.

## Components

Plain HTML plus the `hmd-` classes in `components/bundle.css`. Two small custom elements in `components/bundle.js` (`hmd-copy`, `hmd-video`) add behaviour; everything works without them. Each component's README says what the page must provide.

- **Brand:** Logotype, SectionHeading, Backdrop.
- **Layout:** SkipLink, SiteHeader, SiteFooter, Section (container, section, grid), PageHeader (with breadcrumbs).
- **Actions:** Button, HireBanner, ContactCard.
- **Home and about:** Hero, ServiceCard, Credentials, BioCard, Testimonial, FAQ.
- **Work:** ClientCard (client work, always its own section and first), ProjectCard (open source and tools), ProjectFacts, FeatureList, Figure.
- **Blog:** BlogPostCard, PostHeader, Prose, Callout, CodeBlock, VideoEmbed, TableOfContents, Pagination.
- **Timeline:** TimelineEntry, FilterBar, Chip.

Which page uses which is in the Site plan section.

## Imagery and iconography

- No icon library. Timeline types use shape markers (`hmd-marker--role`, `--award`, `--project`, `--community`) next to their names, so meaning never depends on colour. Arrows and ↗ are text characters.
- Real assets are stored in this system and reused, never redrawn. **Logo & Font:** `hack-make-do-logo-sq.png` (Open Graph and email), `HackMakeDo-transparent.png` (raster logo for places that cannot render the SVG knockout). **Other Assets:** `sprinkles.svg` (pattern, CC 4.0, credit Megan Young / SVGeez), `warren_square.jpg` (portrait). **Umbraco MVP Badges:** the nine official badges, `umbraco-mvp-<year>.png`. **Testimonals:** screenshots of LinkedIn recommendations; transcribe them into Testimonial as text, since quotes in images cannot be read by search engines, AI assistants or screen readers.
- Montserrat ships as `fonts/Montserrat-VariableFont_wght.ttf` (weights 100 to 900); self-host it on the site rather than loading it from Google Fonts. Source Sans 3 still loads from Google Fonts until its file is added.
- Project screenshots: real product screenshots, 16:10, `radius-md`, with alt text that describes and a caption that explains.
