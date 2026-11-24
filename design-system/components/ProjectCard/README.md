A card on the Work page that introduces one project: an optional screenshot, name, one-line purpose, and a bottom row with the technologies as plain text and links to the case study and source.

Markup: `<article class="hmd-card">` with an optional `<img class="hmd-shot">`, `h3`, a paragraph, then `<div class="hmd-card__foot">` holding `<p class="hmd-card__tech">Umbraco · SignalR · Lit</p>` and the `hmd-links`. The foot sits at the bottom of the card, so every card in a row ends on the same line.

- The consumer provides a real screenshot (16:10, with alt text describing what is shown), the project name as it is written on GitHub, one sentence on what it does for whom, up to four technologies, and two links: the case study (primary, `hmd-link`) and the source or Marketplace page (↗).
- The sentence says why it exists, for example "Stops Umbraco editors overwriting each other's work", not "A package for Umbraco".
- Never ship a placeholder frame to production. Until a screenshot exists the card has no image area at all; give every card in a grid a screenshot, or none. Do not substitute stock photography or an illustration.
- Technologies are plain muted text, not chips: elsewhere on the site (blog topics) a pill is a link, so a pill that does nothing reads as a broken filter.
- Show three cards per row on desktop, two on tablet, one on phone, with `space-8` between them. Order by importance to hiring (ContentLock, Compact Log Format Viewer, IIS Express Code first), not by date.
- The whole card is not a link; only the named links are, so each has its own focus ring.
