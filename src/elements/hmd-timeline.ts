import { LitElement } from 'lit';

/**
 * <hmd-timeline>: wraps the FilterBar and the `.tl` entry list already rendered inside it,
 * and progressively enhances them — type filtering, and a newest/oldest sort toggle.
 * Renders into light DOM (no shadow root) and manipulates the existing static markup
 * directly rather than re-rendering it, the same pattern as hmd-copy.
 * Without JavaScript every entry just shows and the filter bar stays hidden.
 */
export class HmdTimeline extends LitElement {
  protected createRenderRoot(): this {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();

    const filterBar = this.querySelector<HTMLElement>('.hmd-filter');
    const list = this.querySelector<HTMLElement>('.tl');
    if (!filterBar || !list) return;

    const statusEl = this.querySelector('[data-timeline-status]');
    const typeButtons = Array.from(filterBar.querySelectorAll<HTMLButtonElement>('button[data-type]'));
    const sortButton = filterBar.querySelector<HTMLButtonElement>('button[data-sort-toggle]');
    const newestFirstOrder = Array.from(list.querySelectorAll<HTMLElement>('.hmd-entry'));
    let oldestFirst = false;

    const applyFilter = () => {
      const activeTypes = new Set(
        typeButtons.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.type),
      );
      let shown = 0;
      for (const entry of newestFirstOrder) {
        const visible = activeTypes.has(entry.dataset.type);
        entry.hidden = !visible;
        if (visible) shown++;
      }
      if (statusEl) statusEl.textContent = `Showing ${shown} of ${newestFirstOrder.length} entries`;
    };

    for (const button of typeButtons) {
      button.addEventListener('click', () => {
        const pressed = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('aria-pressed', String(!pressed));
        applyFilter();
      });
    }

    if (sortButton) {
      sortButton.addEventListener('click', () => {
        oldestFirst = !oldestFirst;
        sortButton.textContent = oldestFirst ? 'Oldest first ⇅' : 'Newest first ⇅';
        sortButton.setAttribute('aria-pressed', String(oldestFirst));
        const ordered = oldestFirst ? newestFirstOrder.slice().reverse() : newestFirstOrder;
        for (const entry of ordered) list.appendChild(entry);
      });
    }

    applyFilter();
    filterBar.hidden = false;
  }
}

if (!customElements.get('hmd-timeline')) customElements.define('hmd-timeline', HmdTimeline);

declare global {
  interface HTMLElementTagNameMap {
    'hmd-timeline': HmdTimeline;
  }
}
