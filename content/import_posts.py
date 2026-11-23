#!/usr/bin/env python3
"""Converts the WordPress export into src/content/posts/*.md.

Source: a WXR export (Tools > Export > All content) plus its matching media
export folder, both supplied by Warren. Two post formats are present in the
export: modern Gutenberg block comments for posts from ~2024 onward, and
"classic editor" HTML (shortcodes + loose paragraphs, wpautop-style) for
everything before that. Each gets its own converter into the same Markdown
output, matching the hand-written example post this file replaces.

Run from the repo root: python3 content/import_posts.py
"""
import html
import json
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse
import xml.etree.ElementTree as ET

REPO = Path(__file__).resolve().parent.parent
XML_PATH = Path('/Users/warren/Downloads/hackmakedo.WordPress.2026-11-06.xml')
MEDIA_ROOT = Path('/Users/warren/Downloads/media-export-55143063-from-0-to-3183')
POSTS_DIR = REPO / 'src/content/posts'
IMAGES_DIR = REPO / 'public/images/blog'

NS = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'excerpt': 'http://wordpress.org/export/1.2/excerpt/',
}

# Same 11-topic mapping as content/build.py, copied verbatim so this script
# has no import-time side effects from that file's CLI/assert-on-import code.
TOPICS = {
    "umbraco": "umbraco umbraco-7 umbraco-8 umbraco-9 umbraco6 umbraco-mvc umbraco-mvc-validation umbraco-regionalisation-errors mvc alttemplates surfacecontroller custom-macro-parameter icontentfinder request-pipeline public-profiles regionalisation examine lucene icons webhooks analytics",
    "bellissima": "bellissima umbraco-bellissima umbraco-14 umbraco-15 umbraco-v14 umbraco-webcomponents webcomponents",
    "umbraco-packages": "umbraco-package package umbraco-extension-methods cws-reboot contribution umbraco-diagnostics diagnostics nucache optimus",
    "umbraco-forms": "umbraco-forms contour contour-form-builder contour-workflow umbraco-contour slack slack-chat slackhq",
    "dotnet": "net netcore netcoreidentity web-api webapi web-api-token-authorisation jwt json-web-tokens authorisation swagger swashbuckle signalr petapoco database validation mvc-validation",
    "javascript": "javascript javascript-snippet angular angularjs belle typescript node node-js nodejs npm grunt gruntjs bower yeoman scaffolding coffeescript sass less compass css html codemirror property-editor property-editors",
    "logging": "logging serilog log4net seq structured-logging logviewer",
    "tooling": "vs-code vscode vs-code-extension iis-express php-iis-express visual-studio visual-studio-extension visual-studio-android-emulator android-emulator vs2015 teamcity continuous-integration git github github-actions github-automation github-sponsors sponsorware powershell powershell-snippet command-line oh-my-posh go codespaces vmware-fusion vms virutal-machines development-setups computer-setups extension ruby azure graphql hacktoberfest",
    "community": "community umbraco-community codegarden codegarden-14 codegarden-15 codegarden-18 codegarden14 cg14 cg15 mvp umbraco-mvp lifetime-mvp uhangout google-hangout google umbraco-community-google-hangout jon-humphrey talk presentation collaboration training umbraco-course teacommerce e-commerce umbraco-e-commerce",
    "personal": "personal health mental-health psychosis new-job work the-cogworks opinion year-review 2013",
    "tutorials": "tutorial umbraco-tutorial code-snippet snippet code programming blog-series web-development umbraco-mvc-series",
}
TAG_TOPIC = {}
for _topic, _words in TOPICS.items():
    for _w in _words.split():
        TAG_TOPIC[_w] = _topic

LANG_MAP = {
    'jscript': 'javascript', 'js': 'javascript', 'javascript': 'javascript',
    'csharp': 'csharp', 'html': 'html', 'xml': 'xml', 'css': 'css',
    'bash': 'bash', 'yaml': 'yaml', 'sql': 'sql', 'powershell': 'powershell',
    'text': '',
}

warnings = []


def warn(slug, msg):
    warnings.append(f'{slug}: {msg}')


# ---------- shared helpers ----------

def local_media_path(url):
    path = unquote(urlparse(url).path)
    idx = path.find('/wp-content/uploads/')
    if idx == -1:
        return None
    return MEDIA_ROOT / path[idx + len('/wp-content/uploads/'):]


def copy_image(slug, src):
    p = local_media_path(src)
    if not p or not p.exists():
        warn(slug, f'missing media file for {src}')
        return None
    dest_dir = IMAGES_DIR / slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / p.name
    if not dest.exists():
        shutil.copy2(p, dest)
    return f'/images/blog/{slug}/{p.name}'


def get_tag_attr(tag, name):
    m = re.search(name + r'="([^"]*)"', tag)
    return html.unescape(m.group(1)) if m else ''


def render_image(slug, src, alt, caption):
    web_path = copy_image(slug, src)
    if not web_path:
        return ''
    if caption:
        return (f'<figure class="hmd-figure">\n'
                 f'  <img src="{web_path}" alt="{html.escape(alt, quote=True)}" loading="lazy" />\n'
                 f'  <figcaption>{html.escape(caption)}</figcaption>\n'
                 f'</figure>')
    return f'![{alt}]({web_path})'


def extract_youtube_id(url):
    m = re.search(r'(?:v=|youtu\.be/)([\w-]{6,})', url)
    return m.group(1) if m else None


def render_embed(slug, url, provider=''):
    url = html.unescape(url)
    if 'youtube' in provider or 'youtu.be' in url or 'youtube.com' in url:
        vid = extract_youtube_id(url)
        if vid:
            # No wrapper: bundle.css spaces .hmd-prose > .hmd-video (no inline styles in markup).
            # The open tag alone on its line makes CommonMark treat this as a raw HTML block, not wrap it in <p>.
            return (f'<hmd-video class="hmd-video" video-id="{vid}">\n'
                    f'  <a class="hmd-video__fallback" href="https://www.youtube.com/watch?v={vid}">Watch on YouTube ↗</a>\n'
                    f'</hmd-video>')
    warn(slug, f'embed with no native component, linked plainly: {url}')
    return f'[Watch ↗]({url})'


def inline_md(s):
    """Inline HTML fragment -> Markdown text (no block-level wrapping)."""
    s = re.sub(r'<br\s*/?>', '  \n', s)
    s = re.sub(r'<(strong|b)>(.*?)</\1>', r'**\2**', s, flags=re.S)
    s = re.sub(r'<(em|i)>(.*?)</\1>', r'*\2*', s, flags=re.S)
    s = re.sub(r'<code>(.*?)</code>', lambda m: '`' + html.unescape(m.group(1)) + '`', s, flags=re.S)

    def _a(m):
        href = html.unescape(m.group(1))
        text = re.sub(r'<[^>]+>', '', m.group(2))
        return f'[{text}]({href})'

    s = re.sub(r'<a\s[^>]*href="([^"]+)"[^>]*>(.*?)</a>', _a, s, flags=re.S)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s)
    return s.strip()


# ---------- Gutenberg block format ----------

TOKEN_RE = re.compile(r'<!--\s*(/?)(wp:[\w/-]+)(\s+(\{.*?\}))?\s*(/)?-->', re.S)


def parse_blocks(src):
    pos = 0
    stack = [{'type': 'root', 'children': []}]
    for m in TOKEN_RE.finditer(src):
        start, end = m.span()
        text_before = src[pos:start]
        if text_before.strip():
            stack[-1]['children'].append(text_before)
        pos = end
        closing = m.group(1) == '/'
        btype = m.group(2)
        attrs_raw = m.group(4)
        selfclose = m.group(5) == '/'
        attrs = {}
        if attrs_raw:
            try:
                attrs = json.loads(attrs_raw)
            except Exception:
                attrs = {}
        if closing:
            stack.pop()
        elif selfclose:
            stack[-1]['children'].append({'type': btype, 'attrs': attrs, 'children': []})
        else:
            node = {'type': btype, 'attrs': attrs, 'children': []}
            stack[-1]['children'].append(node)
            stack.append(node)
    tail = src[pos:]
    if tail.strip():
        stack[-1]['children'].append(tail)
    return stack[0]['children']


def auto_excerpt(body_md):
    """WordPress's own fallback when a post has no manual excerpt: the opening
    text, trimmed to a sentence/word boundary. Reuses the author's own words,
    verbatim, rather than inventing a summary."""
    text = re.sub(r'```.*?```', '', body_md, flags=re.S)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', text)
    text = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', text)
    text = re.sub(r'[#>*`_-]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) <= 180:
        return text
    cut = text[:180]
    m = re.search(r'^.*[.!?]\s', cut)
    if m and len(m.group(0)) > 60:
        return m.group(0).strip()
    sp = cut.rfind(' ')
    return (cut[:sp] if sp > 0 else cut).rstrip('.,;: ') + '…'


BARE_URL_RE = re.compile(r'(?<!\]\()(?<!href=")(?<!src=")(https?://[^\s<>\]\)]+)')
MD_LINK_RE = re.compile(r'\[[^\]]*\]\([^)]*\)')


def linkify_bare_urls(body_md):
    """WordPress auto-links plain-text URLs in post content at render time
    (make_clickable()); reproduce that here since Markdown doesn't do it by
    default, so links that were clickable on the old site stay clickable."""
    out_lines = []
    in_fence = False
    for line in body_md.split('\n'):
        if line.strip().startswith('```'):
            in_fence = not in_fence
            out_lines.append(line)
            continue
        if in_fence or '<hmd-video' in line or '<img' in line or 'href=' in line:
            out_lines.append(line)
            continue

        # Protect existing [text](url) links first - BARE_URL_RE's lookbehind only
        # guards the destination half, so a self-referential [URL](URL) link's own
        # text portion (which also starts with the bare URL) would otherwise get
        # wrapped too, corrupting the link into an empty, nameless anchor.
        protected = []

        def _stash(m):
            protected.append(m.group(0))
            return f'\x00MDLINK{len(protected) - 1}\x00'

        line = MD_LINK_RE.sub(_stash, line)

        def _wrap(m):
            url = m.group(1)
            trail = ''
            while url and url[-1] in '.,;:!?)':
                trail = url[-1] + trail
                url = url[:-1]
            return f'<{url}>{trail}' if url else m.group(0)

        line = BARE_URL_RE.sub(_wrap, line)

        def _restore(m):
            return protected[int(m.group(1))]

        out_lines.append(re.sub(r'\x00MDLINK(\d+)\x00', _restore, line))
    return '\n'.join(out_lines)


def get_raw(node):
    return ''.join(c for c in node['children'] if isinstance(c, str))


def render_block_node(node, slug):
    if isinstance(node, str):
        return inline_md(node) + '\n\n' if node.strip() else ''
    t = node['type']
    attrs = node.get('attrs') or {}
    raw = get_raw(node)

    if t == 'wp:paragraph':
        m = re.match(r'<p[^>]*>(.*)</p>\s*$', raw, re.S)
        return inline_md(m.group(1) if m else raw) + '\n\n'

    if t == 'wp:heading':
        level = attrs.get('level', 2)
        m = re.search(r'<h\d[^>]*>(.*)</h\d>', raw, re.S)
        text = inline_md(m.group(1) if m else raw)
        if not text:
            return ''  # empty heading in the source (old-theme spacer, no real content) - drop it
        return ('#' * level) + ' ' + text + '\n\n'

    if t == 'wp:list':
        ordered = bool(attrs.get('ordered'))
        items = [c for c in node['children'] if not isinstance(c, str) and c['type'] == 'wp:list-item']
        lines = []
        for i, it in enumerate(items):
            marker = f'{i + 1}.' if ordered else '-'
            lines.append(f'{marker} {inline_md(get_raw(it))}')
        return '\n'.join(lines) + '\n\n'

    if t == 'wp:quote':
        inner = ''.join(render_block_node(c, slug) for c in node['children'] if not isinstance(c, str))
        lines = inner.strip('\n').split('\n')
        return '\n'.join(('> ' + l if l else '>') for l in lines) + '\n\n'

    if t == 'wp:code':
        m = re.search(r'<pre[^>]*><code[^>]*>(.*)</code></pre>', raw, re.S)
        code = html.unescape(m.group(1)) if m else html.unescape(raw)
        return '```\n' + code.strip('\n') + '\n```\n\n'

    if t == 'wp:syntaxhighlighter/code':
        lang = LANG_MAP.get(attrs.get('language', ''), attrs.get('language', ''))
        m = re.search(r'<pre[^>]*>(.*)</pre>', raw, re.S)
        code = html.unescape(m.group(1)) if m else html.unescape(raw)
        fence = f'```{lang}\n' if lang else '```\n'
        return fence + code.strip('\n') + '\n```\n\n'

    if t == 'wp:image':
        img_m = re.search(r'<img[^>]*>', raw)
        if not img_m:
            return ''
        img_tag = img_m.group(0)
        src = get_tag_attr(img_tag, 'src')
        alt = get_tag_attr(img_tag, 'alt')
        cap_m = re.search(r'<figcaption[^>]*>(.*?)</figcaption>', raw, re.S)
        caption = inline_md(cap_m.group(1)) if cap_m else ''
        return render_image(slug, src, alt, caption) + '\n\n'

    if t == 'wp:embed':
        return render_embed(slug, attrs.get('url', ''), attrs.get('providerNameSlug', '')) + '\n\n'

    if t == 'wp:button':
        m = re.search(r'<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', raw, re.S)
        if m:
            return f'[{inline_md(m.group(2))}]({html.unescape(m.group(1))})\n\n'
        return ''

    if t == 'wp:buttons':
        parts = [render_block_node(c, slug).strip() for c in node['children'] if not isinstance(c, str)]
        return '\n'.join(p for p in parts if p) + '\n\n'

    if t in ('wp:more', 'wp:separator'):
        return ''

    if t == 'wp:jetpack/gif':
        caption = attrs.get('caption', '')
        url = attrs.get('giphyUrl', '')
        warn(slug, f'Giphy GIF embed dropped (no third-party loads): {url}')
        text = f'*{caption}*' if caption else ''
        return (text + (' ' if text else '') + f'([GIF ↗]({url}))' if url else text) + '\n\n'

    warn(slug, f'unhandled block type {t}, falling back to stripped text')
    return inline_md(raw) + '\n\n'


def convert_block_content(slug, content):
    nodes = parse_blocks(content)
    return ''.join(render_block_node(n, slug) for n in nodes).strip() + '\n'


# ---------- classic editor format ----------

def convert_classic_content(slug, content):
    stash = []

    def put(block_md):
        stash.append(block_md)
        return f'\n\n\x00BLOCK{len(stash) - 1}\x00\n\n'

    c = content
    c = c.replace('<!--more-->', '').replace('<!--nextpage-->', '')

    # [code lang="x"]...[/code] / [code language="x"]...[/code] / [code]...[/code]
    c = re.sub(r'\[code(?:\s+lang(?:uage)?="([\w]*)")?\](.*?)\[/code\]',
                lambda m: put((f'```{LANG_MAP.get(m.group(1) or "", m.group(1) or "")}\n' if m.group(1) else '```\n')
                               + html.unescape(m.group(2)).strip('\n') + '\n```'),
                c, flags=re.S)

    # [caption ...]<a...><img .../></a> Caption text[/caption]
    def _caption(m):
        body = m.group(1)
        img_m = re.search(r'<img[^>]*>', body)
        if not img_m:
            return ''
        img_tag = img_m.group(0)
        src = get_tag_attr(img_tag, 'src')
        alt = get_tag_attr(img_tag, 'alt')
        after = body[img_m.end():]
        after = re.sub(r'^</a>', '', after).strip()
        caption = inline_md(after) if after else ''
        return put(render_image(slug, src, alt, caption))

    c = re.sub(r'\[caption[^\]]*\](.*?)\[/caption\]', _caption, c, flags=re.S)

    # [embed]URL[/embed]
    c = re.sub(r'\[embed\]\s*(.*?)\s*\[/embed\]', lambda m: put(render_embed(slug, m.group(1))), c, flags=re.S)

    # [vimeo ID ...]
    def _vimeo(m):
        vid = m.group(1)
        return put(render_embed(slug, f'https://vimeo.com/{vid}'))

    c = re.sub(r'\[vimeo\s+(\d+)[^\]]*\]', _vimeo, c)

    # [ted id=NNN] -- the talk is always separately linked in prose already
    c = re.sub(r'\[ted[^\]]*\]', '', c)

    # standalone <pre>...</pre> (no shortcode wrapper)
    c = re.sub(r'<pre[^>]*>(.*?)</pre>', lambda m: put('```\n' + html.unescape(m.group(1)).strip('\n') + '\n```'), c, flags=re.S)

    # headings (h1 downgraded to h2 since the page title is already an h1)
    def _heading(m):
        text = inline_md(m.group(2))
        if not text:
            return ''  # empty heading in the source (old-theme spacer, no real content) - drop it
        level = max(2, int(m.group(1)))
        return put(('#' * level) + ' ' + text)

    c = re.sub(r'<h([1-6])[^>]*>(.*?)</h\1>', _heading, c, flags=re.S)

    # lists
    def _list(m, ordered):
        items = re.findall(r'<li[^>]*>(.*?)</li>', m.group(1), re.S)
        lines = [(f'{i + 1}.' if ordered else '-') + ' ' + inline_md(it) for i, it in enumerate(items)]
        return put('\n'.join(lines))

    c = re.sub(r'<ul[^>]*>(.*?)</ul>', lambda m: _list(m, False), c, flags=re.S)
    c = re.sub(r'<ol[^>]*>(.*?)</ol>', lambda m: _list(m, True), c, flags=re.S)

    # blockquotes
    def _quote(m):
        text = inline_md(m.group(1))
        lines = text.split('\n')
        return put('\n'.join(('> ' + l if l else '>') for l in lines))

    c = re.sub(r'<blockquote[^>]*>(.*?)</blockquote>', _quote, c, flags=re.S)

    # standalone images not wrapped in [caption]
    def _img(m):
        img_tag = m.group(0)
        src = get_tag_attr(img_tag, 'src')
        alt = get_tag_attr(img_tag, 'alt')
        return put(render_image(slug, src, alt, ''))

    c = re.sub(r'<a[^>]*>\s*<img[^>]*>\s*</a>|<img[^>]*>', _img, c)

    # remaining plain-text paragraphs, split on blank lines
    chunks = re.split(r'\n\s*\n+', c)
    out = []
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        if re.fullmatch(r'\x00BLOCK\d+\x00', chunk):
            out.append(chunk)
            continue
        out.append(inline_md(chunk))
    body = '\n\n'.join(p for p in out if p)

    def _restore(m):
        return stash[int(m.group(1))]

    body = re.sub(r'\x00BLOCK(\d+)\x00', _restore, body)
    return body.strip() + '\n'


# ---------- post extraction ----------

def load_attachments(root):
    attachments = {}
    for it in root.find('channel').findall('item'):
        pt = it.find('wp:post_type', NS)
        if pt is None or pt.text != 'attachment':
            continue
        pid = it.find('wp:post_id', NS).text
        url = it.find('wp:attachment_url', NS)
        attachments[pid] = url.text if url is not None else None
    return attachments


def main():
    tree = ET.parse(XML_PATH)
    root = tree.getroot()
    channel = root.find('channel')
    items = channel.findall('item')
    attachments = load_attachments(root)

    POSTS_DIR.mkdir(parents=True, exist_ok=True)

    count = 0
    for it in items:
        pt = it.find('wp:post_type', NS)
        if pt is None or pt.text != 'post':
            continue
        status = it.find('wp:status', NS)
        if status is None or status.text != 'publish':
            continue

        slug = it.find('wp:post_name', NS).text
        title = html.unescape(it.find('title').text or '')
        date_raw = it.find('wp:post_date', NS).text  # 'YYYY-MM-DD HH:MM:SS'
        date = date_raw.split(' ')[0]

        excerpt_el = it.find('excerpt:encoded', NS)
        excerpt = html.unescape((excerpt_el.text or '').strip()) if excerpt_el is not None else ''
        excerpt_is_auto = not excerpt

        tags = []
        for cat in it.findall('category'):
            if cat.get('domain') == 'post_tag':
                tags.append(cat.get('nicename'))
        topics = []
        for tag in tags:
            topic = TAG_TOPIC.get(tag)
            if topic is None:
                warn(slug, f'unmapped tag "{tag}", skipped')
                continue
            if topic not in topics:
                topics.append(topic)
        if not topics:
            warn(slug, 'no topics resolved from tags')

        hero_image = None
        for pm in it.findall('wp:postmeta', NS):
            key = pm.find('wp:meta_key', NS).text
            if key == '_thumbnail_id':
                aid = pm.find('wp:meta_value', NS).text
                url = attachments.get(aid)
                if url:
                    hero_image = copy_image(slug, url)
                break

        content = it.find('content:encoded', NS).text or ''
        if '<!-- wp:' in content:
            body = convert_block_content(slug, content)
        else:
            body = convert_classic_content(slug, content)

        body = linkify_bare_urls(body)

        if excerpt_is_auto:
            excerpt = auto_excerpt(body)
            warn(slug, 'no WordPress excerpt; used the post\'s own opening text instead')

        fm_lines = [
            '---',
            f'title: {json.dumps(title)}',
            f'date: {date}',
            f'topics: {json.dumps(topics)}',
            f'excerpt: {json.dumps(excerpt)}',
        ]
        if hero_image:
            fm_lines.append(f'heroImage: {json.dumps(hero_image)}')
        fm_lines.append('draft: false')
        fm_lines.append('---')
        frontmatter = '\n'.join(fm_lines)

        out_path = POSTS_DIR / f'{slug}.md'
        out_path.write_text(frontmatter + '\n\n' + body, encoding='utf-8')
        count += 1

    print(f'wrote {count} posts to {POSTS_DIR}')
    if warnings:
        print(f'\n{len(warnings)} warnings:')
        for w in warnings:
            print(' -', w)


if __name__ == '__main__':
    main()
