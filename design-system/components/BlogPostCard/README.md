A blog index entry: title, date, categories as chips, a two-sentence summary and a read link.

Markup: `<article class="hmd-card">` with `.hmd-meta` (date), `h3` containing the post link, a paragraph, and `.hmd-chips`.

- The consumer provides the post title exactly as published, the publication date in the form "28 April 2025" with a `<time datetime>` element, one to three tags from the post's categories and tags, and a summary of at most two sentences written for a searcher, not a teaser.
- The title is the link (`hmd-link` styling is not used; the `h3` link is `ink` and gains `accent-text` on hover). Do not add a second "Read more" link beside it.
- Posts keep their original publication date. Add a visible "Written for Umbraco 7" style note on the post page itself for old versions; not on the card.
- Show newest first, ten per page, with plain previous and next links.
- Use the `light` theme (Paper) for the post page itself; cards on the index stay on Night.
