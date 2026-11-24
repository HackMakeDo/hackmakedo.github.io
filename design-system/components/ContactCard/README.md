The contact block for the Contact page and the end of the hire pages: a heading, one sentence, the email address shown large with a copy button. No profile links: LinkedIn cannot open a message to Warren, and the footer already links his profiles.

Markup: `<section class="hmd-contact">` with a SectionHeading, a `<p>`, `<div class="hmd-contact__email">` holding `<a class="hmd-contact__address" href="mailto:…">` and `<hmd-copy value="…"><button type="button" class="hmd-btn hmd-btn--secondary hmd-btn--sm">Copy email</button></hmd-copy>`.

- The consumer provides the address, a sentence saying what to include in an enquiry (dates, scope, freelance or contract).
- Show the address as real text in the HTML. Turn off Cloudflare's Email Address Obfuscation for this site: it replaces the address with a script-decoded link that people without JavaScript, crawlers and AI assistants cannot read.
- `hmd-copy` is hidden until its script defines it, so without JavaScript only the mailto link shows. It announces "Copied" to screen readers through a status region.
- No contact form unless a hosted form service is chosen; GitHub Pages cannot process one.
