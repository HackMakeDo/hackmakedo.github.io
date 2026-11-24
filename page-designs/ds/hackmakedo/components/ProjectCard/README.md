A card on the Work page that introduces one project: screenshot, name, one-line purpose, technology chips and links to the case study and source.

Markup: `<article class="hmd-card">` with `.hmd-shot` (an `<img>` inside, or the placeholder text), `h3`, a paragraph, `.hmd-chips`, and links.

- The consumer provides a real screenshot (16:10, with alt text describing what is shown), the project name as it is written on GitHub, one sentence on what it does for whom, up to four chips, and two links: the case study (primary, `hmd-link`) and the source or Marketplace page (↗).
- The sentence says why it exists, for example "Stops Umbraco editors overwriting each other's work", not "A package for Umbraco".
- Never ship a placeholder frame to production. Until a screenshot exists the card shows the dashed `hmd-shot` with the words "Screenshot". Do not substitute stock photography or an illustration.
- Show three cards per row on desktop, two on tablet, one on phone, with `space-8` between them. Order by importance to hiring (ContentLock, Compact Log Format Viewer, IIS Express Code first), not by date.
- The whole card is not a link; only the named links are, so each has its own focus ring.
