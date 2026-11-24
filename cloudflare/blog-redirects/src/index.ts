/**
 * Cloudflare Worker on blog.hackmakedo.com/*: answers every request to the old WordPress blog with a
 * permanent (301) redirect to the same content on hackmakedo.com. It never contacts WordPress.
 * Deploy: see cloudflare/blog-redirects/README.md.
 */
import { redirectFor } from './redirect-for.ts';

export default {
  fetch(request: Request): Response {
    return new Response(null, {
      status: 301,
      headers: {
        Location: redirectFor(request.url),
        // Let browsers and Cloudflare cache the answer for a day; the map rarely changes.
        'Cache-Control': 'public, max-age=86400',
      },
    });
  },
};
