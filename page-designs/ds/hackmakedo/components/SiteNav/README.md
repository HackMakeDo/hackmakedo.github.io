The site header (inline logotype, page links, primary hire button) and the footer carrying the company details.

Markup: `<nav class="hmd-nav" aria-label="Main">` containing the inline logotype linked to `/`, a `<ul>` of links, and a `hmd-btn--primary`. The footer is `<footer class="hmd-footer">`.

- The consumer provides the link list: Work, Blog, About, Timeline and a primary "Hire me" or "Get in touch". Five items at most. Mark the current page with `aria-current="page"` (pink underline).
- On phones the links wrap beneath the logotype; do not hide them behind an icon-only menu until there are more than five.
- The logotype link goes to `/` and its accessible name is "Hack Make Do, home".
- The footer must keep the legal line: Hack Make Do Limited is incorporated in England, company number, registered office and VAT number, as on the current site. Add GitHub, LinkedIn, YouTube, Mastodon and Twitter links as plain text links in `ink`.
- Keep the header on `ground` with a `rule` hairline; no shadow, no sticky blur. If sticky, give it the same flat background.
