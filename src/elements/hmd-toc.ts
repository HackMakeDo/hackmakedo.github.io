import { LitElement } from 'lit';

/**
 * <hmd-toc>: progressively enhances the "On this page" table of contents with scroll-spy -
 * as the reader scrolls, the link for whichever section is currently in view gets
 * aria-current="true" (styled pink and bold in bundle.css), so it's clear where you are in
 * a long post without having to find your place in the article itself.
 * Renders into light DOM and manipulates the existing static markup directly, the same
 * pattern as hmd-timeline. Without JavaScript the plain links still work exactly as before;
 * nothing just highlights.
 */
export class HmdToc extends LitElement {
  protected createRenderRoot(): this {
    return this;
  }

  #onScroll = () => this.#updateActive();
  #headingByLink: { link: HTMLAnchorElement; heading: HTMLElement }[] = [];

  connectedCallback(): void {
    super.connectedCallback();

    const links = Array.from(this.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    this.#headingByLink = links
      .map((link) => ({ link, heading: document.getElementById(link.getAttribute('href')!.slice(1)) }))
      .filter((pair): pair is { link: HTMLAnchorElement; heading: HTMLElement } => pair.heading !== null);
    if (this.#headingByLink.length === 0) return;

    window.addEventListener('scroll', this.#onScroll, { passive: true });
    window.addEventListener('resize', this.#onScroll, { passive: true });
    this.#updateActive();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this.#onScroll);
    window.removeEventListener('resize', this.#onScroll);
  }

  // The current section is the last heading whose top has scrolled above the trigger
  // line (30% down the viewport) - i.e. whichever section the reader most recently
  // reached, not just whatever happens to be exactly at the top of the screen.
  #updateActive() {
    const triggerLine = window.innerHeight * 0.3;
    let current: HTMLElement | null = null;
    for (const { heading } of this.#headingByLink) {
      if (heading.getBoundingClientRect().top <= triggerLine) current = heading;
      else break;
    }
    if (!current) return;
    for (const { link, heading } of this.#headingByLink) {
      if (heading === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }
}

if (!customElements.get('hmd-toc')) customElements.define('hmd-toc', HmdToc);

declare global {
  interface HTMLElementTagNameMap {
    'hmd-toc': HmdToc;
  }
}
