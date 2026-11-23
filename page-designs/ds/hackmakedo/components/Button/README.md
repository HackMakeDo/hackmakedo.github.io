Pill-shaped buttons and links: a pink primary, an outlined secondary, a small size for the header, and a bold underlined text link.

Markup: `<a class="hmd-btn hmd-btn--primary" href="/umbraco-freelancer/">Hire me</a>`; `hmd-btn--secondary` for the quieter action; add `hmd-btn--sm` in the header; `<a class="hmd-link">` for inline links such as "View on GitHub ↗"; wrap several links in `hmd-links`.

- The consumer provides the label (a verb, two to four words) and a real `href`, or a `<button type="button">` with a handler. A link that navigates is an `<a>`; an action is a `<button>`.
- One primary button per view, and it is always the hire action ("Hire me", "Get in touch"). Secondary for "Read the case study", "View on GitHub".
- Text on the pink fill is `on-pink` (9.9:1). On hover the primary flips to `ink` with `ground` text, which reads in both themes. The secondary's outline is `border-strong` (3.1:1 or better) and turns `accent-text` on hover.
- Keep the 0.2s colour transition and the focus ring (3px `focus-ring`, 3px offset). Never remove the outline.
- External links end with ↗. Do not set button labels in uppercase, and do not use more than two button styles in one section.
