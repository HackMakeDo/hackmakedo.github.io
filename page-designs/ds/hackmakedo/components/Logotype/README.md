The Hack Make Do wordmark: Hack, Make and Do stacked, with Make as a true knockout, so the letters are holes in a pink box and the sprinkles, the timeline's WebGL canvas or anything else behind shows through.

How it is built: an inline SVG draws the pink box with the word Make cut out of it by an SVG `<mask>` (white rect, black text). Behind the box sits a second rect filled with `logo-cutout`: transparent on Night, so the letters are see-through; navy on Paper, because the light ground through the letters would be 1.6:1 against pink. The word is set with `textLength`, so the box fits even before Montserrat loads.

```html
<h1 class="hmd-logotype" aria-label="Hack Make Do">
  <span class="hmd-logotype__line">Hack</span>
  <span class="hmd-logotype__line hmd-logotype__make">
    <svg class="hmd-knockout" viewBox="0 0 292 100" aria-hidden="true" focusable="false">
      <mask id="hmd-make-hero" maskUnits="userSpaceOnUse" x="0" y="0" width="292" height="100">
        <rect width="292" height="100" fill="#fff"/>
        <text x="11" y="84" textLength="270" lengthAdjust="spacingAndGlyphs" fill="#000">Make</text>
      </mask>
      <rect class="hmd-knockout__under" width="292" height="100"/>
      <rect class="hmd-knockout__box" width="292" height="100" mask="url(#hmd-make-hero)"/>
    </svg>
  </span>
  <span class="hmd-logotype__line">Do</span>
</h1>
```

- The consumer provides a unique mask `id` per instance on the page (`hmd-make-hero`, `hmd-make-header`, `hmd-make-footer`) and the matching `url(#…)`. Two logotypes sharing an id is invalid HTML and can render the wrong mask.
- Keep `aria-label="Hack Make Do"` on the stacked `h1` (or on the home link for the inline form) and `aria-hidden` on the SVG, so screen readers and crawlers get the name once.
- Stacked form: once, as the home hero, at `--hmd-logo-size` 96px or more (64px on phones). Inline form (`hmd-logotype--inline`): in SiteHeader and SiteFooter, never below 18px.
- Behind the knockout keep things dark: whatever shows through needs 3:1 against `pink`, which means a background of relative luminance 0.15 or less (the Night ground, the 20% white sprinkles and the timeline's contour lines all pass). Thin bright lines crossing the letters are fine; large bright areas are not.
- Force a mode when the theme guess is wrong: `hmd-logotype--see-through` (always transparent, for a dark photo or canvas on a Paper page) or `hmd-logotype--solid` (navy letters on a flat ground, for print and email).
- Only Make is knocked out. Square corners (`radius-none`), no outline, no shadow. Hack and Do are `ink`.
- Never write "HackMakeDo" or "HMD". Do not recolour, stretch or reset it in another typeface. Headings use SectionHeading, not this.
- Email and Open Graph images cannot use the SVG mask: use the existing `/images/hack-make-do-logo-sq.png` there.
