# Personal domains (Cloudflare Worker)

Warren's old domains, `warren-buckley.co.uk` and `warrenbuckley.co.uk`, both Cloudflare zones in the same account.
Their apex DNS records point at Cloudflare's own addresses, so without this Worker each answered with a redirect to
itself (a loop). This Worker answers every request on both apexes:

- **Everything** gets a `301` to `https://hackmakedo.com/about/`, so old links and name searches land on the site.
- **`warren-buckley.co.uk/IsActiveSponsor`** answers `{"validSponsor": true}`. The IIS Express VS Code extension
  ([IIS-Express-Code](https://github.com/warrenbuckley/IIS-Express-Code), v1.5.0 and earlier, `src/credentials.ts`)
  posts the signed-in user's GitHub token here to decide whether to show its sponsorware message. That message is
  retired (24 November 2026), so every user is treated as a sponsor and never sees it. The Worker never reads or logs
  the request body.

Subdomains (`mail`, `smtp`, `forum` on `warrenbuckley.co.uk`) are not routed through the Worker.

**Keep `warren-buckley.co.uk` registered** while old copies of the extension are installed: whoever owns the domain
receives those GitHub tokens (read:user, read:org). A later extension release should remove the check altogether.

## Deploy

From the repo root, after `npx wrangler login`:

```sh
npm run deploy:personal-domains
```

Check it:

```sh
curl -sI https://warrenbuckley.co.uk/anything         # 301, location: https://hackmakedo.com/about/
curl -s -X POST https://warren-buckley.co.uk/IsActiveSponsor -d '{}'   # {"validSponsor":true}
```

**Undo:** Cloudflare dashboard › Workers & Pages › `hackmakedo-personal-domains` › Settings › Domains & Routes,
delete the routes (both domains go back to the redirect loop).
