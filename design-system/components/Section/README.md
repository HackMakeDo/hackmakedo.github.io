The page layout primitives: a centred container, a padded section with an optional heading row, and card grids.

Markup: `<section class="hmd-section" aria-labelledby="work-h">` > `<div class="hmd-container">` > `<div class="hmd-section__head">` (SectionHeading plus an optional "View all" link) and then `<div class="hmd-grid">` of cards.

- The consumer provides the content and an `aria-labelledby` pointing at the section's heading id.
- `hmd-container` caps width at `container-wide` with a `space-6` gutter (`space-4` on phones). `hmd-container--text` caps at `container-text` for reading.
- `hmd-section` pads `space-24` top and bottom, `space-16` on tablets, `space-12` on phones. `hmd-section--panel` gives alternate sections the `panel` ground; never alternate more than every other section.
- `hmd-grid` fits 300px-minimum columns (three on desktop); `hmd-grid--2` fits 420px columns (two on desktop). Gap is `space-8`.
- `hmd-stack` adds `space-6` between stacked blocks.
- Do not nest sections, and do not put a Backdrop in more than one section per page.
