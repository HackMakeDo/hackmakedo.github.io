Small outlined pills for technology tags and categories, the outlined year pill for the timeline, and the shape markers that tell timeline types apart.

Markup: `<span class="hmd-chip">SignalR</span>`; `<span class="hmd-year">2025</span>`; `<span class="hmd-marker hmd-marker--award"></span>`.

- The consumer provides the label text: a technology (Umbraco, Bellissima, Lit, TypeScript, .NET) or a category (Tech, Umbraco, Personal). Keep to one or two words. Show at most five chips on a card.
- Chips are informational. If one filters or navigates, make it an `<a>` or `<button>` with a visible focus ring.
- Timeline types combine a marker shape and a colour: role is a filled circle in `type-role`, award a diamond in `type-award`, project a circle in `type-project`, community a rounded square in `type-community`. Always show the type name beside the marker; colour alone never carries the meaning.
- The year pill is `radius-pill` with a 2px `ink` border. For a range write "2007 to 2011", not a dash.
- Outline is `border-strong`; do not substitute `rule`, which is too faint to mark a control.
