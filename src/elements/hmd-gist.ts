import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';

let count = 0;

/**
 * <hmd-gist gist="user/id" label="...">: a click-to-load GitHub gist. Nothing loads from GitHub
 * until the button is pressed. GitHub's embed is a script that document.write()s the gist, so it
 * runs inside a sandboxed srcdoc iframe (scripts only, no same-origin access to this page), which
 * posts its height back so the frame fits the code. Light DOM, like hmd-video.
 */
export class HmdGist extends LitElement {
  @state()
  private open = false;

  private readonly key = `hmd-gist-${++count}`;

  protected createRenderRoot(): this {
    return this;
  }

  connectedCallback(): void {
    this.replaceChildren(); // drop the no-JS fallback link
    super.connectedCallback();
    window.addEventListener('message', this.onMessage);
  }

  disconnectedCallback(): void {
    window.removeEventListener('message', this.onMessage);
    super.disconnectedCallback();
  }

  private onMessage = (e: MessageEvent) => {
    const frame = this.querySelector('iframe');
    if (!frame || e.source !== frame.contentWindow) return;
    const { key, height } = (e.data ?? {}) as { key?: string; height?: unknown };
    if (key !== this.key || typeof height !== 'number' || !Number.isFinite(height)) return;
    frame.style.height = `${Math.min(Math.ceil(height), 20000)}px`;
  };

  private srcdoc(gist: string): string {
    const src = `https://gist.github.com/${gist.split('/').map(encodeURIComponent).join('/')}.js`;
    return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank">
<style>body{margin:0}.gist .gist-file{margin:0!important}.gist table{tab-size:4}</style></head><body>
<script src="${src}"></script>
<script>
const post = () => parent.postMessage({ key: ${JSON.stringify(this.key)}, height: document.documentElement.scrollHeight }, '*');
new ResizeObserver(post).observe(document.body);
addEventListener('load', post);
</script></body></html>`;
  }

  protected render() {
    const gist = this.getAttribute('gist');
    if (!gist || !/^[\w-]+\/[\da-f]+$/i.test(gist)) return html``;
    const label = this.getAttribute('label') || 'Show the code';

    if (this.open) {
      return html`<iframe
        class="hmd-gist__frame"
        title=${label}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        srcdoc=${this.srcdoc(gist)}
      ></iframe>`;
    }

    return html`<button type="button" class="hmd-gist__show" @click=${() => (this.open = true)}>
      <span class="hmd-gist__icon" aria-hidden="true">{ }</span>
      <span class="hmd-gist__label">Show code: ${label}<span class="hmd-gist__notice">Loads from GitHub, which may set cookies</span></span>
    </button>`;
  }
}

if (!customElements.get('hmd-gist')) customElements.define('hmd-gist', HmdGist);

declare global {
  interface HTMLElementTagNameMap {
    'hmd-gist': HmdGist;
  }
}
