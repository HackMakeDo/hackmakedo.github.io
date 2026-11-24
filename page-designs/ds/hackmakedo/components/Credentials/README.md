The proof strip: two or three true numbers and the row of official Umbraco MVP badges.

Markup: `<section class="hmd-creds">` with `<dl class="hmd-stats">` (each `<div><dt>label</dt><dd>value</dd></div>`; the value is shown above the label) and `<ul class="hmd-badges">` of `<li><img src="/images/umbraco-mvp-2007.png" alt="Umbraco MVP 2007" width="64" height="64"></li>`.

- The consumer provides only facts that can be checked: "9 Umbraco MVP awards" (2007 to 2010, 2014, 2015 lifetime, 2024 to 2026), "20 years building with Umbraco". Update the count each MVP year. No vanity metrics (lines of code, coffees, "happy clients").
- An optional clients line, `<p class="hmd-clients">Clients include <strong>…</strong>, …</p>`, names notable clients as plain text, biggest first (the Council of the European Union leads). Name a client only with their agreement or where the contract allows it; use the institution's official name; never use its logo or emblem (the EU emblem has its own usage rules). Link each name to its case study where one exists.
- Badges are the official images already in `/images/`, in year order, each with its year in the alt text. Never redraw or recolour them.
- Link the strip to the Timeline.
- Place it under the Hero on Home and on the About page. Mirror the awards as `award` values in the Person structured data.
