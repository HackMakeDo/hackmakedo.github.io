import { LitElement } from 'lit';

/**
 * <hmd-marquee>: runs the Marquee ribbon. CSS does the scrolling; this element only starts it
 * (the track animates once the element is :defined), keeps the speed steady whatever the copy
 * length, and wires the pause button that WCAG 2.2.2 requires for anything moving longer than
 * five seconds. A pause is remembered in localStorage (one key, no cookie) so the banner stays
 * still on later visits until it is played again. Renders into light DOM so bundle.css styles it directly.
 */
export class HmdMarquee extends LitElement {
  /** Pixels per second, so short and long copy scroll at the same speed. */
  private static readonly SPEED = 70;
  /** localStorage key holding "1" while the visitor has the banner paused. */
  private static readonly STORAGE_KEY = 'hmd-marquee-paused';
  private resizeObserver?: ResizeObserver;

  protected createRenderRoot(): this {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    const group = this.querySelector<HTMLElement>('.hmd-marquee__group');
    const button = this.querySelector<HTMLButtonElement>('.hmd-marquee__pause');
    const label = button?.querySelector<HTMLElement>('.hmd-sr');

    if (group) {
      const setDuration = () => {
        const seconds = Math.max(20, group.offsetWidth / HmdMarquee.SPEED);
        this.style.setProperty('--hmd-marquee-duration', `${seconds}s`);
      };
      setDuration();
      this.resizeObserver = new ResizeObserver(setDuration);
      this.resizeObserver.observe(group);
    }

    const setPaused = (paused: boolean) => {
      this.toggleAttribute('paused', paused);
      button?.setAttribute('aria-pressed', String(paused));
      if (label) label.textContent = paused ? 'Play the scrolling banner' : 'Pause the scrolling banner';
    };

    // Storage can be blocked (private windows, site data turned off): then the banner simply starts moving.
    try {
      if (localStorage.getItem(HmdMarquee.STORAGE_KEY) === '1') setPaused(true);
    } catch {}

    button?.addEventListener('click', () => {
      const paused = !this.hasAttribute('paused');
      setPaused(paused);
      try {
        if (paused) localStorage.setItem(HmdMarquee.STORAGE_KEY, '1');
        else localStorage.removeItem(HmdMarquee.STORAGE_KEY);
      } catch {}
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }
}

customElements.define('hmd-marquee', HmdMarquee);

declare global {
  interface HTMLElementTagNameMap {
    'hmd-marquee': HmdMarquee;
  }
}
