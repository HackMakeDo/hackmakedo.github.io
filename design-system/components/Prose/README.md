Long-form text styling for blog posts, case study bodies and the About page: headings, paragraphs, lists, quotes, tables, images and code, all inside one wrapper.

Markup: `<div class="hmd-prose">` around the Markdown-rendered HTML. No classes are needed on the elements inside; `pre` blocks are styled like CodeBlock.

- The consumer provides semantic HTML from Markdown: `h2` and `h3` only (the page's `h1` is in PostHeader or PageHeader), real lists, `table` with `th`, and images with alt text and dimensions.
- Give every `h2` and `h3` an `id` so TableOfContents and shared links can target them; they clear the sticky header automatically.
- Start each `h2` section with a sentence that answers its heading directly; this is what AI assistants lift as a citation.
- Width caps at `container-text`. Use the Paper theme (`data-theme="light"` on the article) for posts; case studies can stay on Night.
- Links in prose are `accent-text` and underlined. Lists use `accent-text` markers. Blockquotes sit on `panel` (no coloured side border).
