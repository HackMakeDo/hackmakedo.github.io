import { LitElement } from 'lit';

/**
 * <hmd-copy value="...">: adds copy-to-clipboard to the button it wraps.
 * Without `value`, copies the code of the enclosing .hmd-codeblock (CodeBlock's copy button).
 * Renders into light DOM: bundle.css styles the wrapped button directly, not through a shadow root.
 */
export class HmdCopy extends LitElement {
  private timer?: ReturnType<typeof setTimeout>;

  protected createRenderRoot(): this {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    const button = this.querySelector('button');
    if (!button) return;

    const original = button.textContent;
    const live = document.createElement('span');
    live.className = 'hmd-sr';
    live.setAttribute('role', 'status');
    this.appendChild(live);

    button.addEventListener('click', () => {
      const isCode = !this.hasAttribute('value');
      const block = isCode ? this.closest('.hmd-codeblock') : null;
      const code = block ? block.querySelector('pre code') ?? block.querySelector('pre') : null;

      let value = this.getAttribute('value');
      if (isCode) {
        const lines = code ? code.querySelectorAll('.line') : [];
        value = lines.length
          ? Array.from(lines)
              .filter((l) => !(l.classList.contains('diff') && l.classList.contains('remove')))
              .map((l) => l.textContent ?? '')
              .join('\n')
          : (code?.textContent ?? '').replace(/\n$/, '');
      }

      const reset = () => {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          button.textContent = original;
          button.removeAttribute('data-copied');
          live.textContent = '';
        }, 2000);
      };

      if (navigator.clipboard?.writeText && value != null) {
        navigator.clipboard.writeText(value).then(
          () => {
            button.textContent = 'Copied';
            button.setAttribute('data-copied', '');
            live.textContent = isCode ? 'Code copied to the clipboard' : `Copied ${value} to the clipboard`;
            reset();
          },
          () => {
            live.textContent = 'Could not copy. Select the address instead.';
            reset();
          },
        );
      }
    });
  }
}

if (!customElements.get('hmd-copy')) customElements.define('hmd-copy', HmdCopy);

declare global {
  interface HTMLElementTagNameMap {
    'hmd-copy': HmdCopy;
  }
}
