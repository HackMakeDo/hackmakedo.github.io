/** Nine posts per page: a full 3x3 row of BlogPostCard at the Grid component's default desktop width. */
export const PAGE_SIZE = 9;

export function totalPagesFor(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

export function pageSlice<T>(items: T[], page: number): T[] {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

/** Page 1 has no /page/1/ URL; it's the bare listing/topic URL itself. */
export function pageHref(base: string, page: number): string {
  return page <= 1 ? base : `${base}page/${page}/`;
}

/** Static paths for pages 2..totalPages of a listing whose page 1 lives at `base` outside this route. */
export function extraPagePaths(base: string, count: number) {
  const totalPages = totalPagesFor(count);
  const paths = [];
  for (let page = 2; page <= totalPages; page++) {
    paths.push({ params: { page: String(page) }, props: { page, totalPages } });
  }
  return paths;
}
