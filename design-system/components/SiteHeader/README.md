The site header: the inline Logotype linking home, the main navigation and one "Hire me" button.

Markup: `<header class="hmd-header">` > `<div class="hmd-container hmd-header__inner">` holding `<a class="hmd-header__home" href="/" aria-label="Hack Make Do, home">` (inline Logotype), `<nav class="hmd-nav" aria-label="Main"><ul>…</ul></nav>` and `<a class="hmd-btn hmd-btn--primary hmd-btn--sm">`.

- The consumer provides four links (Work, Blog, Timeline, About) and the hire link, which points at the Umbraco freelancer page. Mark the current section with `aria-current="page"`.
- Variants: `hmd-header--sticky` for content pages; `hmd-header--overlay` sits transparently over the Home hero's Backdrop, so the see-through Logotype shows the sprinkles.
- No hamburger menu: on phones the links wrap onto their own row under the logotype. Add a disclosure menu only if the list grows past five.
- The inline Logotype's mask id must differ from the hero's (`hmd-make-header`).
- Height is at least `header-height`; anchored headings use it for `scroll-margin-top`.
- No shadow, no blur, no colour change on scroll.
