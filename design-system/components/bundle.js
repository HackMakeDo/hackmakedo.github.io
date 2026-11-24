/* @ds-bundle: {"format":4,"namespace":"HackMakeDo","components":[{"name":"Logotype"},{"name":"SectionHeading"},{"name":"Backdrop"},{"name":"SkipLink"},{"name":"SiteHeader"},{"name":"SiteFooter"},{"name":"Section"},{"name":"PageHeader"},{"name":"Button"},{"name":"HireBanner"},{"name":"ContactCard"},{"name":"Hero"},{"name":"ServiceCard"},{"name":"Credentials"},{"name":"BioCard"},{"name":"Testimonial"},{"name":"FAQ"},{"name":"ClientCard"},{"name":"ProjectCard"},{"name":"ProjectFacts"},{"name":"FeatureList"},{"name":"Figure"},{"name":"BlogPostCard"},{"name":"PostHeader"},{"name":"Prose"},{"name":"Callout"},{"name":"CodeBlock"},{"name":"VideoEmbed"},{"name":"TableOfContents"},{"name":"Pagination"},{"name":"TimelineEntry"},{"name":"FilterBar"},{"name":"Chip"}]} */
/* Hack Make Do components are plain HTML styled by components/bundle.css (classes prefixed hmd-).
   Two progressive enhancements are defined here as dependency-free custom elements:
   - <hmd-copy value="...">: adds copy-to-clipboard to the button it wraps (hidden until defined).
     Without value, it copies the code of the .hmd-codeblock it sits in (CodeBlock's copy button).
   - <hmd-video video-id="..." label="...">: a click-to-load YouTube embed; nothing loads from YouTube until clicked.
   Both are small enough to port to Lit one-to-one. */
(function () {
  'use strict';

  class HmdCopy extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      var button = this.querySelector('button');
      if (!button) return;
      var original = button.textContent;
      var live = document.createElement('span');
      live.className = 'hmd-sr';
      live.setAttribute('role', 'status');
      this.appendChild(live);
      var self = this;
      button.addEventListener('click', function () {
        // value="..." copies that text; without it, copies the code of the enclosing .hmd-codeblock
        var isCode = !self.hasAttribute('value');
        var block = isCode ? self.closest('.hmd-codeblock') : null;
        var code = block ? block.querySelector('pre code') || block.querySelector('pre') : null;
        var value = self.getAttribute('value');
        if (isCode) {
          // Copy line by line where lines are marked up, leaving out lines removed in a diff
          var lines = code ? code.querySelectorAll('.line') : [];
          value = lines.length
            ? Array.prototype.filter.call(lines, function (l) { return !(l.classList.contains('diff') && l.classList.contains('remove')); })
                .map(function (l) { return l.textContent; }).join('\n')
            : (code ? code.textContent.replace(/\n$/, '') : '');
        }
        var reset = function () {
          clearTimeout(self._timer);
          self._timer = setTimeout(function () {
            button.textContent = original; button.removeAttribute('data-copied'); live.textContent = '';
          }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(function () {
            button.textContent = 'Copied';
            button.setAttribute('data-copied', '');
            live.textContent = isCode ? 'Code copied to the clipboard' : 'Copied ' + value + ' to the clipboard';
            reset();
          }, function () {
            live.textContent = 'Could not copy. Select the address instead.';
            reset();
          });
        }
      });
    }
  }

  class HmdVideo extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      // If this script runs before the page has finished parsing, the element's own children
      // (the fallback link) are not there yet: wait, or they would be added on top of the button.
      if (document.readyState === 'loading') {
        var self0 = this;
        document.addEventListener('DOMContentLoaded', function () { self0.connectedCallback(); }, { once: true });
        return;
      }
      this._ready = true;
      var id = this.getAttribute('video-id');
      if (!id) return;
      var label = this.getAttribute('label') || 'Play video';
      var poster = this.getAttribute('poster');
      if (poster !== 'none') {
        var src = poster || 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg';
        this.style.backgroundImage = 'url("' + src.replace(/"/g, '%22') + '")';
      }
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'hmd-video__play';
      var icon = document.createElement('span');
      icon.className = 'hmd-video__icon';
      icon.setAttribute('aria-hidden', 'true');
      var text = document.createElement('span');
      text.className = 'hmd-video__label';
      text.textContent = 'Play: ' + label;
      // Tell people before they click that playing loads YouTube (which can store cookies), so the click is an informed choice
      var notice = document.createElement('span');
      notice.className = 'hmd-video__notice';
      notice.textContent = this.getAttribute('notice') || 'Plays from YouTube, which may set cookies';
      text.append(notice);
      button.append(icon, text);
      var self = this;
      button.addEventListener('click', function () {
        var frame = document.createElement('iframe');
        frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
        frame.title = label;
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        frame.allowFullscreen = true;
        self.replaceChildren(frame);
        frame.focus();
      });
      this.replaceChildren(button);
    }
  }

  if (!customElements.get('hmd-copy')) customElements.define('hmd-copy', HmdCopy);
  if (!customElements.get('hmd-video')) customElements.define('hmd-video', HmdVideo);

  window.HackMakeDo = window.HackMakeDo || {};
  window.HackMakeDo.HmdCopy = HmdCopy;
  window.HackMakeDo.HmdVideo = HmdVideo;
})();
