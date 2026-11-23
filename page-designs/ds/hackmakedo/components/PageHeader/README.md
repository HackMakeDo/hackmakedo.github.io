The top of every inner page: breadcrumbs, an eyebrow, the page's one `h1` and a lead paragraph.

Markup: `<header class="hmd-pagehead hmd-container">` with `<nav class="hmd-breadcrumbs" aria-label="Breadcrumb"><ol>…</ol></nav>`, `<p class="hmd-eyebrow">`, `<h1 class="hmd-pagehead__title">` and `<p class="hmd-pagehead__lead">`.

- The consumer provides the trail (Home, then each parent, ending with the current page as plain text with `aria-current="page"`), the eyebrow (the section name: Case study, Hire, About), the title and a lead of one or two sentences.
- The lead is answer-first: it states the fact a searcher or an AI assistant would quote ("Warren Buckley is a UK-based Umbraco contractor available for day-rate work with agencies and in-house teams."), not a teaser.
- Output matching `BreadcrumbList` structured data for the same trail.
- Title is 64px Montserrat 800 (40px on phones). Use one `h1` per page; the home page's `h1` is the Logotype instead.
- Blog posts use PostHeader, not this.
