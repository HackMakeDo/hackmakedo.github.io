Previous and next links for the blog index and tag pages, with the page position between them.

Markup: `<nav class="hmd-pagination" aria-label="Blog pages"><a rel="prev" href="…">← Newer posts</a><span>Page 2 of 32</span><a rel="next" href="…">Older posts →</a></nav>`.

- The consumer provides the two URLs and the page count. On the first or last page, render the missing link as `<span aria-disabled="true">` so the layout holds.
- Each page has its own crawlable URL (`/blog/page/2/`) and a self-referencing canonical; never load more posts with JavaScript only.
- Words, not just arrows: "Newer posts" and "Older posts".
