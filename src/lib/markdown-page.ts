/** A plain-text Markdown response for a page's `.md` GEO companion (site-plan.md §3). */
export function markdownResponse(body: string): Response {
  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
