The home page opening: the stacked see-through Logotype over a Backdrop, one answer-first sentence, and the hire actions.

Markup: `<section class="hmd-hero">` (it is already a backdrop host) > Backdrop layer > `<div class="hmd-container hmd-hero__body">` with the Logotype `h1`, `<p class="hmd-hero__lead">` and `<div class="hmd-hero__actions">`. Pair with `hmd-header--overlay` so the header floats over the backdrop.

- The consumer provides the backdrop (sprinkles or a canvas), the lead and two actions: primary "Hire me" to the freelancer page and secondary "See my work".
- The lead names the search phrases in plain words: "Warren Buckley, a freelance **Umbraco developer and contractor** and nine-time Umbraco MVP." Keep it to one sentence; this is the line Google and AI assistants are most likely to quote.
- One Hero per site, on Home only. Inner pages use PageHeader.
- Height is the viewport (capped at 880px); content is vertically centred and clears the overlay header.
- Logotype 96 to 120px on desktop, 64px on phones. Lead in `ink` at 22px (19px on phones).
- The canvas must not block reading: keep its brightest strokes thin and its fills under the lead dark.
