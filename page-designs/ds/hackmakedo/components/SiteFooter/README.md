The site footer: link columns, profiles elsewhere, and the company's legal details.

Markup: `<footer class="hmd-footer">` > `.hmd-container` > `.hmd-footer__grid` of columns (each an `h2` and a `ul`), then `<div class="hmd-footer__legal">`.

- The consumer provides four columns: Hire (Umbraco freelancer, Umbraco contractor, Contact), Work (top three case studies and All work), Writing (Blog, Timeline, RSS feed) and Elsewhere (GitHub, LinkedIn, YouTube, Mastodon, Umbraco Marketplace).
- The legal block must stay word for word: "Hack Make Do Limited is incorporated in England. Company No: 15432884. Registered Office: Castle House, Castle Street, Guildford, GU1 3UW. VAT Number: GB 458891924".
- Profile links use `rel="me"` (Mastodon verification) and are the same URLs as the `sameAs` list in the site's structured data.
- Add a credits line for the sprinkles pattern (CC 4.0, Megan Young, SVGeez).
- Text is `ink-muted` on `ground` (7.7:1); links are `ink`.
