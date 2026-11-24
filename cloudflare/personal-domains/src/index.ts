/**
 * Warren's two old personal domains, warren-buckley.co.uk and warrenbuckley.co.uk.
 *
 * - /IsActiveSponsor (warren-buckley.co.uk only) is where the IIS Express VS Code extension (v1.5.0 and earlier)
 *   posts the user's GitHub token to ask "is this user a sponsor?". The sponsor message is retired, so every
 *   user is told yes and the message never shows. The request body (the token) is never read or logged.
 * - Everything else gets a permanent redirect to the About page on hackmakedo.com.
 */
const SPONSOR_CHECK = '/isactivesponsor';
const TARGET = 'https://hackmakedo.com/about/';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === 'warren-buckley.co.uk' && url.pathname.toLowerCase() === SPONSOR_CHECK) {
      return Response.json({ validSponsor: true }, { headers: { 'Cache-Control': 'no-store' } });
    }

    return Response.redirect(TARGET, 301);
  },
};
