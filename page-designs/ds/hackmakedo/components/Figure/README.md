A screenshot or diagram with a caption, and a gallery grid of them for case studies.

Markup: `<figure class="hmd-figure"><img src alt width height loading="lazy" decoding="async"><figcaption>…</figcaption></figure>`; several inside `<div class="hmd-gallery">`.

- The consumer provides real product screenshots (AVIF or WebP, with a PNG fallback if needed) with `width` and `height` set to avoid layout shift, alt text that says what the screenshot shows, and a caption that says why it matters.
- Alt text and caption differ: alt describes ("The online users panel listing three editors"), the caption explains ("Editors can see who else is in the backoffice and start a call").
- Use the same 16:10 crop within a gallery. Short screen recordings go in a `<video muted loop playsinline controls>` in the same figure.
- `hmd-shot` is the placeholder until the screenshot exists; never ship it.
- The first image of a case study is also its Open Graph image.
