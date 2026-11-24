The top of a blog post: breadcrumbs, title, date line and tags.

Markup: `<header class="hmd-posthead hmd-container--text">` with Breadcrumbs, `<h1 class="hmd-posthead__title">`, `<p class="hmd-posthead__meta">` (`<time datetime>` published, reading time, and "Updated" with its own `<time>` when edited) and `<ul class="hmd-chips">` of linked tag chips.

- The consumer provides the title exactly as originally published, the original publish date (migrated posts keep theirs), an updated date only when the content changed, a reading time, and one to four tags.
- Dates read "28 April 2025". Mirror them as `datePublished` and `dateModified` in the post's `Article` structured data, with Warren as `author` (the same `@id` as the site's Person).
- Posts written for an old Umbraco version get a Callout (`hmd-callout--archive`) directly under this header.
- Title is 48px Montserrat 700 (34px on phones). The post body below uses Prose on the Paper theme.
