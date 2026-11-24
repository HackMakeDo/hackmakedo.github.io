import { LitElement } from 'lit';

/**
 * <hmd-search>: wraps the 404 page's search form. Pagefind (built against `dist/`
 * after `astro build`, via the `postbuild` script) loads only once the search box
 * gets focus — nothing loads just from visiting the page. Without JavaScript the
 * form's own action/inputs fall back to a site-limited Google search.
 */
interface PagefindResult {
  data: () => Promise<{ url: string; excerpt: string; meta: { title?: string } }>;
}
interface Pagefind {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
}

export class HmdSearch extends LitElement {
  private pagefind?: Pagefind;
  private loading?: Promise<Pagefind>;

  protected createRenderRoot(): this {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();

    const form = this.querySelector('form');
    const input = this.querySelector<HTMLInputElement>('input[type="search"]');
    const results = this.querySelector<HTMLElement>('[data-search-results]');
    if (!form || !input || !results) return;

    const load = () => {
      if (!this.loading) {
        // pagefind.js is generated into dist/pagefind/ by the `postbuild` script after `astro build`,
        // so it doesn't exist at typecheck or bundle time — the Function wrapper keeps Vite/Rollup
        // from trying to resolve it statically (the standard way to load Pagefind in a bundled site).
        const dynamicImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<Pagefind>;
        this.loading = dynamicImport('/pagefind/pagefind.js')
          .then((mod) => (this.pagefind = mod))
          .catch(() => undefined) as Promise<Pagefind>;
      }
      return this.loading;
    };

    input.addEventListener('focus', load, { once: true });

    // Results appear without a page load, so say what happened for screen reader users.
    const status = document.createElement('p');
    status.className = 'hmd-sr';
    status.setAttribute('role', 'status');
    results.before(status);

    const runSearch = async (query: string) => {
      await load();
      if (!this.pagefind || !query.trim()) {
        results.replaceChildren();
        status.textContent = '';
        return;
      }
      const { results: hits } = await this.pagefind.search(query);
      const data = await Promise.all(hits.slice(0, 8).map((hit) => hit.data()));
      results.replaceChildren();
      if (data.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = `No results for "${query}".`;
        results.appendChild(empty);
        status.textContent = empty.textContent;
        return;
      }
      status.textContent = `${data.length === 1 ? '1 result' : `${data.length} results`} for "${query}".`;
      const list = document.createElement('ul');
      list.className = 'hmd-grid';
      for (const page of data) {
        const li = document.createElement('li');
        li.className = 'hmd-card';
        const h3 = document.createElement('h3');
        const a = document.createElement('a');
        a.href = page.url;
        // Page titles end in " — Hack Make Do"; on this site's own results that's noise.
        a.textContent = (page.meta.title ?? page.url).replace(/\s+—\s+Hack Make Do$/, '');
        h3.appendChild(a);
        const p = document.createElement('p');
        p.innerHTML = page.excerpt;
        li.append(h3, p);
        list.appendChild(li);
      }
      results.appendChild(list);
    };

    form.addEventListener('submit', (event) => {
      if (!this.pagefind) return; // no JS/Pagefind yet: let the real form submission fall back
      event.preventDefault();
      runSearch(input.value);
    });
  }
}

if (!customElements.get('hmd-search')) customElements.define('hmd-search', HmdSearch);

declare global {
  interface HTMLElementTagNameMap {
    'hmd-search': HmdSearch;
  }
}
