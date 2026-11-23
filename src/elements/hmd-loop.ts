import { LitElement, html, svg } from 'lit';
import { state } from 'lit/decorators.js';

const pauseIcon = svg`<rect x="3" y="2" width="3.5" height="12" rx="1" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" />`;
const playIcon = svg`<path d="M4 2.5v11a1 1 0 0 0 1.5.86l9-5.5a1 1 0 0 0 0-1.72l-9-5.5A1 1 0 0 0 4 2.5Z" />`;

/**
 * <hmd-loop> around a muted, looping <video>: a GIF replacement. It plays by itself while it is on
 * screen (and stops when scrolled away), with a pause button for WCAG 2.2.2, since anything moving
 * for more than five seconds must be stoppable. Under reduced motion it shows its poster frame and
 * waits for play. The <video> uses preload="none", so nothing downloads until it plays; without
 * JavaScript it keeps its native controls. Light DOM, so bundle.css styles it.
 */
export class HmdLoop extends LitElement {
  @state() private playing = false;
  private video?: HTMLVideoElement | null;
  private observer?: IntersectionObserver;
  /** Set once the visitor presses pause, so scrolling back into view doesn't restart it. */
  private stoppedByVisitor = false;
  private readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  protected createRenderRoot(): this {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.video = this.querySelector('video');
    const video = this.video;
    if (!video) return;
    video.controls = false;
    video.addEventListener('play', this.sync);
    video.addEventListener('pause', this.sync);
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!this.stoppedByVisitor && !this.reducedMotion.matches) video.play().catch(() => {});
        } else video.pause();
      },
      { threshold: 0.5 },
    );
    this.observer.observe(video);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.video?.removeEventListener('play', this.sync);
    this.video?.removeEventListener('pause', this.sync);
  }

  private sync = () => {
    this.playing = !!this.video && !this.video.paused;
  };

  private toggle() {
    const video = this.video;
    if (!video) return;
    if (video.paused) {
      this.stoppedByVisitor = false;
      video.play().catch(() => {});
    } else {
      this.stoppedByVisitor = true;
      video.pause();
    }
  }

  protected render() {
    // Lit renders after the <video>, which stays where the page put it.
    return html`<button type="button" class="hmd-loop__toggle" @click=${this.toggle}>
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">${this.playing ? pauseIcon : playIcon}</svg>
      <span class="hmd-sr">${this.playing ? 'Pause the animation' : 'Play the animation'}</span>
    </button>`;
  }
}

if (!customElements.get('hmd-loop')) customElements.define('hmd-loop', HmdLoop);

declare global {
  interface HTMLElementTagNameMap {
    'hmd-loop': HmdLoop;
  }
}
