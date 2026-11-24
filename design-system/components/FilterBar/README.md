The timeline's controls: toggle buttons for each entry type, and a sort-order toggle.

Markup: `<div class="hmd-filter" role="group" aria-label="Filter the timeline">` with `<span class="hmd-filter__label">Show</span>`, one `<button type="button" aria-pressed="true">` per type (each with its marker and name), `<span class="hmd-filter__sep" aria-hidden="true"></span>`, then the sort button.

- The consumer provides the types (Role, Award, Project, Community), wires each button to show or hide its entries, and updates `aria-pressed`. The sort button's label states the current order ("Oldest first") and swaps on press.
- Pressed is a solid `ink` outline on `panel`; not pressed is a dashed outline with `ink-muted` text. The state is carried by the outline style and the attribute, not by colour.
- With JavaScript off, show every entry and hide the bar (render it from script, or add `hidden` and remove it on load).
- Announce the result ("Showing 12 of 34 entries") in a `role="status"` region next to the bar.
