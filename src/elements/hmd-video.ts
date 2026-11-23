import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';

type Provider = 'youtube' | 'vimeo' | 'ted' | 'instagram';

const PROVIDERS: Record<Provider, { name: string; embed: (id: string, start: number, kind: string) => string }> = {
  youtube: {
    name: 'YouTube',
    embed: (id, start) =>
      `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0${start ? `&start=${start}` : ''}`,
  },
  vimeo: {
    name: 'Vimeo',
    // dnt=1: Vimeo's "do not track" mode, so the player sets no tracking cookies.
    embed: (id, start) => `https://player.vimeo.com/video/${encodeURIComponent(id)}?autoplay=1&dnt=1${start ? `#t=${start}s` : ''}`,
  },
  ted: {
    name: 'TED',
    // video-id is the talk's slug from its ted.com/talks/<slug> address.
    embed: (id) => `https://embed.ted.com/talks/${encodeURIComponent(id)}`,
  },
  instagram: {
    name: 'Instagram',
    // Reels embed from /reel/<id>/embed/; /p/<id>/embed/ reports a reel as "broken".
    embed: (id, _start, kind) => `https://www.instagram.com/${kind === 'reel' ? 'reel' : 'p'}/${encodeURIComponent(id)}/embed/`,
  },
};

/**
 * <hmd-video video-id="..." provider="youtube|vimeo|ted|instagram" start="seconds" kind="reel" label="...">:
 * a click-to-load embed. Nothing loads from the provider until the button is pressed: the poster
 * is served from this site (/images/video-posters/<provider>-<id>.jpg, downloaded by
 * `npm run video-posters`, which `npm run build` checks for). Instagram has no poster, so it
 * shows a plain panel. `poster="none"` also gives the plain panel; `poster="<url>"` overrides.
 * Renders into light DOM so bundle.css's .hmd-video rules apply without a shadow boundary.
 */
export class HmdVideo extends LitElement {
  @state()
  private playing = false;

  protected createRenderRoot(): this {
    return this;
  }

  private get provider(): Provider {
    const p = this.getAttribute('provider');
    return p === 'vimeo' || p === 'ted' || p === 'instagram' ? p : 'youtube';
  }

  connectedCallback(): void {
    // Lit renders into this element (light DOM) but, unlike replaceChildren(), doesn't clear
    // pre-existing children: drop the no-JS fallback link now that script has taken over.
    this.replaceChildren();

    super.connectedCallback();
    const id = this.getAttribute('video-id') ?? '';
    const poster = this.getAttribute('poster');
    if (this.provider === 'instagram' && !poster) this.setAttribute('poster', 'none');
    if (poster === 'none' || this.getAttribute('poster') === 'none') return;
    const src = poster || `/images/video-posters/${this.provider}-${id}.jpg`;
    this.style.backgroundImage = `url("${src.replace(/"/g, '%22')}")`;
  }

  protected render() {
    const id = this.getAttribute('video-id');
    if (!id) return html``;

    const provider = PROVIDERS[this.provider];
    const start = Number(this.getAttribute('start')) || 0;
    const label = this.getAttribute('label') || (this.provider === 'instagram' ? 'Show the Instagram post' : 'Play video');
    const notice = this.getAttribute('notice') || `Loads from ${provider.name}, which may set cookies`;

    if (this.playing) {
      return html`<iframe
        src=${provider.embed(id, start, this.getAttribute('kind') ?? '')}
        title=${label}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>`;
    }

    return html`<button type="button" class="hmd-video__play" @click=${() => (this.playing = true)}>
      <span class="hmd-video__icon" aria-hidden="true"></span>
      <span class="hmd-video__label">${this.provider === 'instagram' ? label : html`Play: ${label}`}<span class="hmd-video__notice">${notice}</span></span>
    </button>`;
  }
}

if (!customElements.get('hmd-video')) customElements.define('hmd-video', HmdVideo);

declare global {
  interface HTMLElementTagNameMap {
    'hmd-video': HmdVideo;
  }
}
