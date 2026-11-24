An "On this page" list of a long post's or case study's sections.

Markup: `<nav class="hmd-toc" aria-labelledby="toc-h"><h2 class="hmd-toc__title" id="toc-h">On this page</h2><ol><li><a href="#options">…</a></li></ol></nav>`; add `hmd-toc--sticky` in a side column.

- The consumer provides the `h2` headings of the page and their ids, generated at build time from the Markdown.
- Show it on posts and case studies with four or more `h2` sections; skip it on short posts.
- On wide screens place it sticky in a side column; on narrow screens put it after PostHeader.
- Optionally mark the section in view with `aria-current="true"` from a small script; it works without.
