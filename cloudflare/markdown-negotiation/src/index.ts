/**
 * Cloudflare Worker on hackmakedo.com/*: Markdown for agents on the Free plan. Requests that prefer
 * `Accept: text/markdown` get the page's Markdown copy; every other request passes straight through to
 * GitHub Pages (a Worker's fetch to its own zone goes to the origin, not back through the Worker).
 * Deploy: see cloudflare/markdown-negotiation/README.md.
 */
import { negotiate } from './negotiate.ts';

export default {
  fetch(request: Request): Promise<Response> {
    return negotiate(request, (input, init) => fetch(input, init));
  },
};
