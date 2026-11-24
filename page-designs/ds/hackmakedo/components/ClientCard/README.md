A wide card for client work: a pink "Client work" tag, the client's name, what was done and what came of it, a short fact row, and a recommendation from someone on that project beside it.

Markup:

```html
<article class="hmd-card hmd-client">
  <div class="hmd-client__story">
    <p class="hmd-client__tag">Client work</p>
    <h3><a href="/work/council-of-the-european-union/">Council of the European Union</a></h3>
    <p class="hmd-client__summary">…</p>
    <dl class="hmd-client__facts"><div><dt>Role</dt><dd>…</dd></div>…</dl>
    <div class="hmd-links"><a class="hmd-link" href="…">Read the case study</a></div>
  </div>
  <figure class="hmd-client__quote"><blockquote>…</blockquote><figcaption>Name<span>Role</span></figcaption></figure>
</article>
```

- Client work and open source are different kinds of proof, so they never share a grid. The Work page shows a "Client work" section of ClientCards first (stacked in `hmd-clients-list`, one per row), then an "Open source and tools" section of ProjectCards. The hire pages show ClientCards only.
- The consumer provides the client's official name (only with their permission; otherwise a description such as "a European Union institution"), a two-sentence summary in the form *what you did, then what it achieved*, two to four facts (Role, Scope, Engagement, Period), and the case study link.
- The quote is one or two sentences taken verbatim from a recommendation by someone on that project, with their name and role. Trim only with "[…]". No quote available? Leave the figure out and the story takes the full width.
- No screenshots, logos or emblems on client cards: client sites are theirs to show, and the EU emblem has its own usage rules.
- Never invent outcomes, figures or dates. Facts the client hasn't cleared stay out.
- Mark a client case study page up as an `Article` about the work. The recommendation is not `Review` data.
