A single LinkedIn recommendation on a panel, with the author's name linked to their profile and their role beneath.

Markup: `<figure class="hmd-quote"><blockquote><p>…</p></blockquote><figcaption><a href="https://www.linkedin.com/in/…">Name</a><span>Role, Company · via LinkedIn</span></figcaption></figure>`; several inside `hmd-grid--2`.

- The consumer provides the recommendation as text, word for word from LinkedIn (keep the author's spelling and punctuation), one `<p>` per paragraph, plus the author's name, role, company where LinkedIn gives one, and profile URL. Write names in normal case even if LinkedIn shows capitals.
- Never reword, merge or invent. Trim only with "[…]" and only on short placements; the full text goes on the Kind words page.
- Where to use which (current set: Ceri Broussine, Pete Cooper, Simone Chiaretta, Cornelia Vasile):
  - `/umbraco-contractor/`: Pete Cooper (contractor on a large, complex Umbraco project) and Ceri Broussine (large and complex Umbraco builds).
  - Council of the European Union case study: Simone Chiaretta and Cornelia Vasile, who worked at the Council on the v13 to v16 migration. One of them also appears in that project's ClientCard.
  - `/umbraco-freelancer/`: Simone Chiaretta or Cornelia Vasile (complex Umbraco migrations, team upskilling).
  - Home: one short quote (Ceri Broussine fits best), linking to Kind words.
  - Kind words page: all of them, newest first.
- Quote text is `body-lg` in `ink` on `panel`; a large `accent-text` quotation mark opens it.
- Keep testimonials as HTML text, not screenshots: search engines, AI assistants and screen readers can read text but not images.
- Do not add `Review` or `AggregateRating` structured data for these.

Long quotes can take `hmd-quote--wide` (the Astro component's `wide` prop): the card spans every column of its grid and sets the quote in two columns where there is room (`columns: 2 24em`), with the opening quote mark spanning both. Place wide cards so the half-width ones still pair up.
