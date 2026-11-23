# Old blog redirects (Cloudflare Worker)

The old WordPress blog lives at `blog.hackmakedo.com` (WordPress.com, behind Cloudflare). This Worker takes over
that hostname and answers every request with a permanent (301) redirect to the same content on `hackmakedo.com`:
posts to `/blog/<slug>/`, `?p=` shortlinks to their post, tags to their post or topic, images to their new home,
and anything it doesn't recognise to `/blog/`. WordPress is never contacted again.

- `src/redirect-for.ts`: the rules (a port of `target()` in `content/rules.py`)
- `src/map.json`: lookups built from `content/blog-url-map.csv` (`npm run redirects -- --build-map`)
- `npm run redirects`: offline check that all 471 old URLs go where the map says and every target exists in `dist/`

## Deploy (launch day, after the new site is live)

Order matters: the redirects point at pages that only exist once `site-redesign` is merged and deployed.

1. Merge the PR and wait for the GitHub Pages deploy. Check `https://hackmakedo.com/blog/` shows the new site.
2. From the repo root, sign in to Cloudflare (opens a browser; once per machine) and check it's the right account:

   ```sh
   npx wrangler login
   npx wrangler whoami
   ```

   Then deploy:

   ```sh
   npm run deploy:redirects
   ```

   This creates the Worker `hackmakedo-blog-redirects` and the route `blog.hackmakedo.com/*` on the
   `hackmakedo.com` zone. Leave the `blog` DNS record as it is: it must stay **Proxied** (orange cloud) for the
   route to run.
3. From the repo root, check every old URL against the live Worker and every target against the live site:

   ```sh
   npm run redirects -- --live --targets
   ```

4. Google Search Console: in the `blog.hackmakedo.com` property, use **Settings › Change of address** to tell Google
   the blog moved to `hackmakedo.com`. Then submit `https://hackmakedo.com/sitemap-index.xml` in the
   `hackmakedo.com` property.

**Undo:** in the Cloudflare dashboard, Workers & Pages › `hackmakedo-blog-redirects` › Settings › Domains & Routes,
delete the route. `blog.hackmakedo.com` goes straight back to WordPress.

Once the redirects have run for a few weeks with no surprises, you can stop paying for the WordPress.com site.
Keep the `blog` DNS record and the Worker for as long as old links might be out there (years: they cost nothing).
