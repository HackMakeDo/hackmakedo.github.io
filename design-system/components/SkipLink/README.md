A "Skip to content" link that stays off-screen until it receives keyboard focus, then appears as a pink pill at the top left.

Markup: `<a class="hmd-skip" href="#main">Skip to content</a>` as the first element in `<body>`, and `<main id="main" tabindex="-1">` on every page.

- The consumer provides the target id; it must exist on every template, including posts and case studies.
- Keep the wording "Skip to content". Do not hide it with `display: none`, which removes it from keyboard order.
- Text is `on-pink` on `pink` (9.9:1); the focus ring still shows around it.
