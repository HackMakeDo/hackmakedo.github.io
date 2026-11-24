import csv, re, sys, glob, json
from collections import Counter, defaultdict
from urllib.parse import urlsplit, parse_qs
src = open('build.py').read()
exec(src[:src.index('OLD, NEW =')])          # P, T, TOPICS, tag_topic (already verified against WordPress)
from single import SINGLE                     # tags used on exactly one post (verified)
single = dict(SINGLE)
post_by_slug = {s for _, _, s in P}
post_by_id = {pid: s for pid, _, s in P}
NEW = 'https://hackmakedo.com'
# Renamed posts (old slug -> new). Empty: the site kept every WordPress slug, including my-development-setup-whats-yours.
OVERRIDES = {}
# Media Google knows about, by upload path -> where the import put it (public/images/blog/<post>/<file>).
MEDIA = {
    '2018/06/i-attended-the-umbraco-examine-course-you-wont-believe-what-happened-next_updated.pdf':
        '/images/blog/i-attended-the-umbraco-examine-course-you-wont-believe-what-happened-next/i-attended-the-umbraco-examine-course-you-wont-believe-what-happened-next_updated.pdf',
    '2023/10/oh-my-posh-umbraco-terminal.png':
        '/images/blog/how-i-learnt-a-new-programming-language-over-hacktoberfest-by-creating-an-umbraco-segment-for-oh-my-posh/oh-my-posh-umbraco-terminal.png',
    # Two posts have an image.png; this one matches the WordPress file byte for byte (checked 19 November 2026).
    '2023/10/image.png':
        '/images/blog/how-i-learnt-a-new-programming-language-over-hacktoberfest-by-creating-an-umbraco-segment-for-oh-my-posh/image.png',
    '2014/06/umbraco-sys-servervariables_customised.png':
        '/images/blog/what-on-earth-is-umbraco-servervariables-parsing/umbraco-sys-servervariables_customised.png',
}
new_slug = lambda s: OVERRIDES.get(s, s)
cats = {'personal': 'personal', 'umbraco': 'umbraco', 'tech': None}

def target(url):
    """Mirror of the Cloudflare rules: decide by path; query strings are dropped except ?p= and ?page_id=."""
    u = urlsplit(url); path = u.path or '/'; q = parse_qs(u.query)
    if not path.endswith('/') and '.' not in path.rsplit('/', 1)[-1]: path += '/'
    if path == '/':
        if 'p' in q and int(q['p'][0]) in post_by_id: return f"{NEW}/blog/{new_slug(post_by_id[int(q['p'][0])])}/", 'R03 ?p= shortlink'
        if q.get('page_id') == ['1064']: return f'{NEW}/contact/', 'R04 ?page_id=1064'
        return f'{NEW}/blog/', 'R01 blog home'
    if path.startswith('/wp-content/uploads/'):
        media = MEDIA.get(path[len('/wp-content/uploads/'):])
        return (f'{NEW}{media}', 'R05 media file') if media else (f'{NEW}/blog/', 'R99 unknown media file')
    m = re.fullmatch(r'/\d{4}/\d{2}/\d{2}/([^/]+)/(.*)', path)
    if m:
        slug = m.group(1)
        return (f'{NEW}/blog/{new_slug(slug)}/', ('R02b renamed post' if slug in OVERRIDES else 'R02 post') + (' (comment page or attachment)' if m.group(2) else '')) if slug in post_by_slug else (f'{NEW}/blog/', 'R99 unknown post slug')
    if re.fullmatch(r'/\d{4}/(\d{2}/)?(page/\d+/)?', path): return f'{NEW}/blog/', 'R06 date archive'
    if re.fullmatch(r'/page/\d+/', path): return f'{NEW}/blog/', 'R07 paged home'
    m = re.fullmatch(r'/tag/([^/]+)/(page/\d+/)?', path)
    if m:
        t = m.group(1)
        if t in single: return f'{NEW}/blog/{new_slug(single[t])}/', 'R08 single-post tag to its post'
        if t in tag_topic: return f'{NEW}/blog/topic/{tag_topic[t]}/', 'R09 tag to topic'
        return f'{NEW}/blog/', 'R99 unknown tag'
    m = re.fullmatch(r'/category/([^/]+)/(page/\d+/)?', path)
    if m:
        c = cats.get(m.group(1)); return (f'{NEW}/blog/topic/{c}/' if c else f'{NEW}/blog/'), 'R10 category'
    if path.startswith('/author/'): return f'{NEW}/about/', 'R11 author'
    if path.endswith('/feed/'): return f'{NEW}/blog/rss.xml', 'R12 feed'
    if path == '/contact/': return f'{NEW}/contact/', 'R13 contact'
    return f'{NEW}/blog/', 'R99 catch-all'

# 1. every URL WordPress knows about (from the verified map), 2. every URL Google has shown
urls = {}
for r in csv.DictReader(open('blog-url-map.csv')):
    if r.get('found_in', 'wordpress') in ('wordpress', 'both'): urls.setdefault(r['old_url'], {'source': 'wordpress', 'clicks': '', 'impressions': ''})
gsc = sys.argv[1]
for r in csv.DictReader(open(gsc)):
    d = urls.setdefault(r['Top pages'], {'source': 'google', 'clicks': '', 'impressions': ''})
    if d['source'] == 'wordpress': d['source'] = 'both'
    d['clicks'], d['impressions'] = r['Clicks'], r['Impressions']

rows, by_rule = [], Counter()
for url, d in urls.items():
    new, rule = target(url); by_rule[rule] += 1
    rows.append([url, new, rule, d['source'], d['clicks'], d['impressions']])
rows.sort(key=lambda r: (-(int(r[4]) if r[4] else -1), -(int(r[5]) if r[5] else -1), r[0]))
with open('blog-url-map.csv', 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['old_url', 'new_url', 'rule', 'found_in', 'google_clicks_16m', 'google_impressions_16m']); w.writerows(rows)
print('total', len(rows), Counter(d['source'] for d in urls.values()))
for k, v in sorted(by_rule.items()): print(f'  {v:4} {k}')
print('google-only URLs:'); [print('  ', r[0], '->', r[1], r[2]) for r in rows if r[3] == 'google' and not r[2].startswith(('R02', 'R05', 'R06', 'R07'))]
print('R99:', [r[0] for r in rows if r[2].startswith('R99')])
print('media files google knows:', [r[0] for r in rows if r[2].startswith('R05')])
