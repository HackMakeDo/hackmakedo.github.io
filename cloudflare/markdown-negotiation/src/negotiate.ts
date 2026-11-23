/**
 * Content negotiation for hackmakedo.com: a request whose Accept header prefers text/markdown gets the
 * page's Markdown copy (<page>/index.html.md, written by the build); everything else gets the normal
 * response from GitHub Pages. Pure logic, kept apart from the Worker so it can be tested with Node.
 */

/** True when the Accept header asks for Markdown at least as strongly as for HTML. */
export function wantsMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  let markdown = -1;
  let html = -1;
  for (const part of accept.split(',')) {
    const [type, ...params] = part.trim().toLowerCase().split(';');
    const qParam = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
    const q = qParam ? Number(qParam.slice(2)) : 1;
    if (Number.isNaN(q)) continue;
    if (type === 'text/markdown') markdown = Math.max(markdown, q);
    if (type === 'text/html') html = Math.max(html, q);
  }
  return markdown > 0 && markdown >= html;
}

/** Where a page's Markdown copy lives, or null for things that aren't pages (images, feeds, files). */
export function markdownPathFor(pathname: string): string | null {
  if (pathname.endsWith('/')) return `${pathname}index.html.md`;
  if (pathname.endsWith('.html')) return `${pathname}.md`;
  const last = pathname.slice(pathname.lastIndexOf('/') + 1);
  return last.includes('.') ? null : `${pathname}/index.html.md`;
}

/** Rough token count for the x-markdown-tokens header: about four bytes per token. */
export const estimateTokens = (bytes: number) => Math.ceil(bytes / 4);

type Fetch = (input: Request | string, init?: RequestInit) => Promise<Response>;

/**
 * Link headers for agent discovery (RFC 8288): every page points at its Markdown copy, and the homepage
 * also at llms.txt, the site's description for agents. No api-catalog or service-desc: the site has no API.
 */
export function discoveryLinks(pathname: string, mdPath: string | null): string[] {
  const links: string[] = [];
  if (pathname === '/') links.push('</llms.txt>; rel="describedby"; type="text/markdown"');
  if (mdPath) links.push(`<${mdPath}>; rel="alternate"; type="text/markdown"`);
  return links;
}

/** HTML pages: adds Accept to Vary (so caches keep the HTML and Markdown answers apart) and the discovery links. */
function decorateHtml(response: Response, pathname: string, mdPath: string | null): Response {
  const type = response.headers.get('content-type') ?? '';
  if (!type.startsWith('text/html') || !response.ok) return response;
  const copy = new Response(response.body, response);
  const vary = copy.headers.get('vary');
  if (!vary || !/\baccept\b/i.test(vary)) copy.headers.set('vary', vary ? `${vary}, Accept` : 'Accept');
  for (const link of discoveryLinks(pathname, mdPath)) copy.headers.append('link', link);
  return copy;
}

export async function negotiate(request: Request, fetchOrigin: Fetch): Promise<Response> {
  const url = new URL(request.url);
  const mdPath = markdownPathFor(url.pathname);
  const isRead = request.method === 'GET' || request.method === 'HEAD';

  if (isRead && mdPath && wantsMarkdown(request.headers.get('accept'))) {
    const md = await fetchOrigin(new URL(mdPath, url).toString());
    if (md.ok) {
      const body = await md.text();
      const bytes = new TextEncoder().encode(body).length;
      const headers = new Headers({
        'content-type': 'text/markdown; charset=utf-8',
        vary: 'Accept',
        'x-markdown-tokens': String(estimateTokens(bytes)),
        link: `<${url.origin}${url.pathname}>; rel="canonical"`,
        'cache-control': md.headers.get('cache-control') ?? 'public, max-age=600',
      });
      return new Response(request.method === 'HEAD' ? null : body, { status: 200, headers });
    }
    // No copy for this address (a 404, or a page type without one): fall through to the normal response.
  }
  return decorateHtml(await fetchOrigin(request), url.pathname, mdPath);
}
