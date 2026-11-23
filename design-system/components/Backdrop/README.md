A background layer that sits behind a section's content: the sprinkles pattern, or a canvas such as the timeline's WebGL contour field.

Markup: give the parent `hmd-backdrop-host` (or use Hero, which already is one), then put `<div class="hmd-backdrop hmd-backdrop--sprinkles" aria-hidden="true"></div>` or `<div class="hmd-backdrop" aria-hidden="true"><canvas></canvas></div>` as its first child.

- The consumer provides the image or the canvas. For sprinkles set `--hmd-sprinkles-image: url(/images/sprinkles.svg)` once in the site CSS (656px tile, `--hmd-sprinkles-size`). For WebGL, render into the canvas the way `contour-field.js` does today; the layer handles position, size and stacking.
- `hmd-backdrop--fixed` pins the layer to the viewport, as the timeline does with `#field`; `hmd-backdrop--drift` slowly moves the sprinkles.
- The layer paints `ground` first, so content never sits on an empty frame while a canvas starts.
- Respect reduced motion: drift stops automatically; a WebGL script should check `matchMedia('(prefers-reduced-motion: reduce)')` and draw one still frame (the current timeline script does not check it).
- Keep it dark under any text: text sitting on a backdrop must still reach 4.5:1 (`ink` on the Night ground is 14.5:1; keep pattern elements at the sprinkles' 20% white or fainter). The Logotype's see-through letters need the layer at relative luminance 0.15 or less.
- Use it on the Home hero, the Timeline and at most one other section per page. Content pages (posts, case studies) stay flat.
- Always `aria-hidden="true"`; a backdrop carries no content. The sprinkles pattern is CC 4.0 (Megan Young, SVGeez): keep the credit in the site's credits or footer.
