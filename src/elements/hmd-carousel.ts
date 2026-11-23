import { LitElement, html, render, nothing } from 'lit';

/**
 * <hmd-carousel>: enhances the scroll-snap row rendered by Carousel.astro with previous/next
 * buttons, one marker per position, and a polite status message. Renders into light DOM
 * around the existing track; the slides themselves are never moved, cloned or hidden.
 *
 * Without JavaScript the track is still a native, keyboard-focusable scroll-snap row with a
 * themed scrollbar and a "Scroll or swipe" hint. Once this element upgrades it sets
 * [enhanced], which hides the scrollbar and the hint because the buttons and markers take over.
 *
 * Navigation is by snap position, not by slide: with two quotes per view and four quotes there
 * are three positions (1–2, 2–3, 3–4). Positions are measured from the layout, so they follow
 * the container query that switches between one and two quotes per view.
 */
export class HmdCarousel extends LitElement {
  /** Singular and plural names for one slide, used in button labels and announcements. */
  static properties = {
    item: { type: String },
    items: { type: String },
  };

  declare item: string;
  declare items: string;

  private track?: HTMLElement;
  private slides: HTMLElement[] = [];
  private positions: number[] = [];
  private perView = 1;
  private current = 0;
  private settled = 0;
  private pending: number | null = null;
  private frame = 0;
  private settleTimer?: ReturnType<typeof setTimeout>;
  private controls = document.createElement('div');
  private markers = document.createElement('nav');
  private status = document.createElement('p');
  private resizeObserver?: ResizeObserver;

  constructor() {
    super();
    this.item = 'recommendation';
    this.items = 'recommendations';
  }

  protected createRenderRoot(): this {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.track = this.querySelector<HTMLElement>('.hmd-carousel__track') ?? undefined;
    if (!this.track) return;
    const items = Array.from(this.track.children) as HTMLElement[];
    if (items.length < 2) return;

    // Each slide gets a plain wrapper carrying the slide semantics. The items themselves keep
    // their own roles: a <figure> with a <figcaption> must stay a figure, so it can't be the group.
    const total = items.length;
    this.slides = items.map((item, i) => {
      const slide = document.createElement('div');
      slide.className = 'hmd-carousel__slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${i + 1} of ${total}`);
      item.before(slide);
      slide.append(item);
      return slide;
    });

    this.controls.className = 'hmd-carousel__controls';
    this.markers.className = 'hmd-carousel__markers';
    this.markers.setAttribute('aria-label', `Choose ${this.items}`);
    this.status.className = 'hmd-sr';
    this.status.setAttribute('role', 'status');

    // Buttons before the track in DOM order, so keyboard order matches reading order.
    this.track.before(this.controls);
    this.track.after(this.markers, this.status);

    this.track.addEventListener('scroll', this.onScroll, { passive: true });
    if ('onscrollend' in window) {
      this.track.addEventListener('scrollend', this.onSettle);
    }
    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(this.track);

    this.setAttribute('enhanced', '');
    this.measure();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.track?.removeEventListener('scroll', this.onScroll);
    this.track?.removeEventListener('scrollend', this.onSettle);
    cancelAnimationFrame(this.frame);
    clearTimeout(this.settleTimer);
  }

  /** Recompute snap positions from the layout (one or two slides per view). */
  private measure(): void {
    const track = this.track!;
    const max = track.scrollWidth - track.clientWidth;
    const trackLeft = track.getBoundingClientRect().left - track.scrollLeft;
    const offsets = this.slides.map((s) => Math.min(Math.round(s.getBoundingClientRect().left - trackLeft), max));
    this.positions = offsets.filter((o, i) => i === 0 || o > offsets[i - 1] + 1);
    this.perView = this.slides.length - this.positions.length + 1;
    this.current = this.nearest();
    this.settled = this.current;
    this.draw();
  }

  private nearest(): number {
    const x = this.track!.scrollLeft;
    let best = 0;
    this.positions.forEach((p, i) => {
      if (Math.abs(p - x) < Math.abs(this.positions[best] - x)) best = i;
    });
    return best;
  }

  private onScroll = (): void => {
    // Fallback settle for browsers without scrollend.
    if (!('onscrollend' in window)) {
      clearTimeout(this.settleTimer);
      this.settleTimer = setTimeout(this.onSettle, 120);
    }
    // While a click's scroll is in flight the markers already show its target.
    if (this.pending !== null || this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      const next = this.nearest();
      if (next !== this.current) {
        this.current = next;
        this.draw();
      }
    });
  };

  private onSettle = (): void => {
    this.pending = null;
    this.current = this.nearest();
    if (this.current !== this.settled) {
      this.settled = this.current;
      this.status.textContent = this.describe(this.current);
    }
    this.draw();
  };

  private go(index: number): void {
    const target = Math.max(0, Math.min(index, this.positions.length - 1));
    this.pending = target;
    this.current = target;
    this.draw();
    const smooth = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    this.track!.scrollTo({ left: this.positions[target], behavior: smooth ? 'smooth' : 'auto' });
  }

  private step(delta: number): void {
    this.go((this.pending ?? this.current) + delta);
  }

  /** "Showing recommendations 2 and 3 of 4", or "Showing recommendation 2 of 4". */
  private describe(position: number): string {
    const total = this.slides.length;
    const first = position + 1;
    const last = Math.min(position + this.perView, total);
    if (first === last) return `Showing ${this.item} ${first} of ${total}`;
    const range = last === first + 1 ? `${first} and ${last}` : `${first} to ${last}`;
    return `Showing ${this.items} ${range} of ${total}`;
  }

  private draw(): void {
    const count = this.positions.length;
    this.toggleAttribute('static', count < 2);
    if (count < 2) {
      render(nothing, this.controls);
      render(nothing, this.markers);
      return;
    }
    const atStart = this.current === 0;
    const atEnd = this.current === count - 1;

    // A focused button that becomes disabled would drop focus to <body>; hand it to its partner.
    const focused = document.activeElement;
    const prev = this.controls.querySelector<HTMLButtonElement>('[data-dir="prev"]');
    const next = this.controls.querySelector<HTMLButtonElement>('[data-dir="next"]');

    const arrow = (d: string) =>
      html`<svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=${d} /></svg>`;

    render(
      html`
        <button type="button" class="hmd-carousel__btn" data-dir="prev" ?disabled=${atStart} @click=${() => this.step(-1)}>
          ${arrow('M12.5 4.5 7 10l5.5 5.5')}<span class="hmd-sr">Previous ${this.items}</span>
        </button>
        <button type="button" class="hmd-carousel__btn" data-dir="next" ?disabled=${atEnd} @click=${() => this.step(1)}>
          ${arrow('M7.5 4.5 13 10l-5.5 5.5')}<span class="hmd-sr">Next ${this.items}</span>
        </button>
      `,
      this.controls,
    );

    render(
      html`${this.positions.map(
        (_, i) => html`<button
          type="button"
          class="hmd-carousel__marker"
          aria-current=${i === this.current ? 'true' : 'false'}
          @click=${() => this.go(i)}
        ><span class="hmd-sr">${this.describe(i).replace('Showing', 'Show')}</span></button>`,
      )}`,
      this.markers,
    );

    if (focused === prev && atStart) next?.focus();
    if (focused === next && atEnd) prev?.focus();
  }
}

if (!customElements.get('hmd-carousel')) customElements.define('hmd-carousel', HmdCarousel);

declare global {
  interface HTMLElementTagNameMap {
    'hmd-carousel': HmdCarousel;
  }
}
