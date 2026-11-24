/**
 * How people and crawlers reach hackmakedo.com, from Cloudflare's analytics: a baseline for SEO and AEO work.
 *
 *   npm run report:traffic                                 the last 7 days
 *   npm run report:traffic -- --days 30                    the last 30 days (the most Cloudflare's Free plan keeps)
 *   npm run report:traffic -- --from 2026-11-24 --to 2026-12-01
 *   npm run report:traffic -- --json > traffic-2026-12-01.json    the same figures as JSON, to compare later
 *
 * Needs CLOUDFLARE_API_TOKEN (in the environment or a git-ignored .env) for a token with
 * Zone: Zone Read, Zone: Analytics Read and Account: Account Analytics Read.
 *
 * What it can't tell you: search queries, rankings, impressions or AI answers that quote the site without a
 * click. Those are in Google Search Console and Bing Webmaster Tools.
 * Run with Node 22.18+ (it runs TypeScript directly).
 */

export {}; // a module, so its types don't mix with the DOM's globals (Report) in astro check

const HOST = 'hackmakedo.com';
const OLD_BLOG_HOST = 'blog.hackmakedo.com';
const API = 'https://api.cloudflare.com/client/v4';
/** Free plan: zone request analytics cover at most 30 days at a time, going back 31 days. */
const MAX_DAYS = 30;
const DAY = 86_400_000;

// ---------- arguments ----------

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const asJson = args.includes('--json');

function period(): { from: Date; to: Date } {
  const fromArg = arg('--from');
  const toArg = arg('--to');
  const to = toArg ? new Date(`${toArg}T00:00:00Z`) : new Date();
  const from = fromArg ? new Date(`${fromArg}T00:00:00Z`) : new Date(to.getTime() - Number(arg('--days') ?? 7) * DAY);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
    fail('Give --days <n>, or --from and --to as YYYY-MM-DD with --from first.');
  }
  if (to.getTime() - from.getTime() > MAX_DAYS * DAY) fail(`Cloudflare's Free plan allows at most ${MAX_DAYS} days at a time.`);
  if (Date.now() - from.getTime() > (MAX_DAYS + 1) * DAY) fail(`Cloudflare's Free plan keeps request data for ${MAX_DAYS + 1} days only.`);
  return { from, to };
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

// ---------- Cloudflare ----------

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  fail(
    'Set CLOUDFLARE_API_TOKEN (or put it in .env). Create a token at dash.cloudflare.com/profile/api-tokens with\n' +
      'Zone: Zone Read, Zone: Analytics Read and Account: Account Analytics Read.',
  );
}

async function cf<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const body = (await res.json()) as { errors?: unknown; data?: unknown; result?: unknown };
  if (!res.ok || (Array.isArray(body.errors) && body.errors.length)) {
    fail(`Cloudflare ${path} answered ${res.status}: ${JSON.stringify(body.errors)}`);
  }
  return body as T;
}

type Row<D> = { count: number; avg?: { sampleInterval: number }; sum?: { visits: number }; dimensions: D };

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  return (await cf<{ data: T }>('/graphql', { method: 'POST', body: JSON.stringify({ query, variables }) })).data;
}

// ---------- classifying ----------

/** Referrer hosts, grouped. The first matching group wins. */
const REFERRER_GROUPS: [string, RegExp][] = [
  ['AI assistant', /(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com|claude\.ai|perplexity\.ai|copilot\.microsoft\.com|gemini\.google\.com|chat\.mistral\.ai|you\.com|phind\.com|kagi\.com\/assistant)$/],
  ['Search engine', /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com|ecosia\.org|kagi\.com|search\.brave\.com|yandex\.[a-z.]+|baidu\.com|startpage\.com|qwant\.com)$/],
  ['Social', /(^|\.)(linkedin\.com|lnkd\.in|t\.co|x\.com|twitter\.com|bsky\.app|facebook\.com|reddit\.com|news\.ycombinator\.com|mastodon\.[a-z.]+|threads\.net|youtube\.com|instagram\.com)$/],
  ['Old blog', /^blog\.hackmakedo\.com$/],
  ['This site', /^(www\.)?hackmakedo\.com$/],
  ['Developer sites', /(^|\.)(github\.com|stackoverflow\.com|umbraco\.com|our\.umbraco\.com|marketplace\.umbraco\.com|dev\.to|medium\.com)$/],
];

function referrerGroup(host: string): string {
  if (!host) return 'None (direct, apps, or referrer removed)';
  return REFERRER_GROUPS.find(([, re]) => re.test(host))?.[0] ?? 'Other sites';
}

/**
 * Named crawlers by what they do with the page. "Fetch for a user" means someone asked an AI assistant a
 * question just now and it read the page to answer: the closest thing to an AI citation Cloudflare can see.
 */
const CRAWLERS: { name: string; re: RegExp; role: string }[] = [
  { name: 'ChatGPT-User', re: /ChatGPT-User/i, role: 'Fetch for a user' },
  { name: 'Claude-User', re: /Claude-User/i, role: 'Fetch for a user' },
  { name: 'Perplexity-User', re: /Perplexity-User/i, role: 'Fetch for a user' },
  { name: 'MistralAI-User', re: /MistralAI-User/i, role: 'Fetch for a user' },
  { name: 'DuckAssistBot', re: /DuckAssistBot/i, role: 'Fetch for a user' },
  { name: 'OAI-SearchBot', re: /OAI-SearchBot/i, role: 'AI search index' },
  { name: 'Claude-SearchBot', re: /Claude-SearchBot/i, role: 'AI search index' },
  { name: 'PerplexityBot', re: /PerplexityBot/i, role: 'AI search index' },
  { name: 'GPTBot', re: /GPTBot/i, role: 'AI training' },
  { name: 'ClaudeBot', re: /ClaudeBot/i, role: 'AI training' },
  { name: 'meta-externalagent', re: /meta-externalagent/i, role: 'AI training' },
  { name: 'CCBot', re: /CCBot/i, role: 'AI training' },
  { name: 'Bytespider', re: /Bytespider/i, role: 'AI training' },
  { name: 'Amazonbot', re: /Amazonbot/i, role: 'AI training' },
  { name: 'Googlebot', re: /Googlebot/i, role: 'Search engine' },
  { name: 'bingbot', re: /bingbot/i, role: 'Search engine' },
  { name: 'Applebot', re: /Applebot/i, role: 'Search engine' },
  { name: 'DuckDuckBot', re: /DuckDuckBot/i, role: 'Search engine' },
  { name: 'YandexBot', re: /YandexBot/i, role: 'Search engine' },
];

/** Cloudflare's own verified-bot categories that are AI. */
const AI_CATEGORIES = ['AI Crawler', 'AI Assistant', 'AI Search'];
const DISCOVERY_FILES = ['/robots.txt', '/llms.txt', '/sitemap-index.xml', '/sitemap.xml', '/blog/rss.xml'];

// ---------- queries ----------

async function main() {
  const { from, to } = period();
  const vars = { since: from.toISOString(), until: to.toISOString() };

  const zone = (await cf<{ result: { id: string; account: { id: string } }[] }>(`/zones?name=${HOST}`)).result[0];
  if (!zone) fail(`The token can't see the ${HOST} zone.`);

  // Web Analytics: real browsers that ran the beacon, so humans (and the odd headless browser).
  const rum = await graphql<{
    viewer: { accounts: { pages: Row<{ refererHost: string; requestPath: string }>[] }[] };
  }>(
    `query($a: String!, $since: Time!, $until: Time!) { viewer { accounts(filter: { accountTag: $a }) {
      pages: rumPageloadEventsAdaptiveGroups(limit: 5000, orderBy: [count_DESC],
        filter: { datetime_geq: $since, datetime_lt: $until, requestHost: "${HOST}", bot: 0 }) {
        count avg { sampleInterval } sum { visits } dimensions { refererHost requestPath }
      }
    } } }`,
    { ...vars, a: zone.account.id },
  );

  // Requests at the edge: every crawler, whether or not it runs JavaScript.
  const site = `clientRequestHTTPHost: "${HOST}", datetime_geq: $since, datetime_lt: $until`;
  const http = await graphql<{
    viewer: {
      zones: {
        categories: Row<{ verifiedBotCategory: string }>[];
        agents: Row<{ userAgent: string }>[];
        aiPaths: Row<{ clientRequestPath: string; edgeResponseContentTypeName: string }>[];
        files: Row<{ clientRequestPath: string }>[];
        oldBlog: Row<{ verifiedBotCategory: string }>[];
      }[];
    };
  }>(
    `query($z: String!, $since: Time!, $until: Time!, $ai: [String!]!, $files: [String!]!) { viewer { zones(filter: { zoneTag: $z }) {
      categories: httpRequestsAdaptiveGroups(limit: 50, orderBy: [count_DESC], filter: { ${site} }) {
        count avg { sampleInterval } dimensions { verifiedBotCategory }
      }
      agents: httpRequestsAdaptiveGroups(limit: 10000, orderBy: [count_DESC], filter: { ${site} }) {
        count dimensions { userAgent }
      }
      aiPaths: httpRequestsAdaptiveGroups(limit: 5000, orderBy: [count_DESC], filter: { ${site}, verifiedBotCategory_in: $ai }) {
        count dimensions { clientRequestPath edgeResponseContentTypeName }
      }
      files: httpRequestsAdaptiveGroups(limit: 20, orderBy: [count_DESC], filter: { ${site}, clientRequestPath_in: $files }) {
        count dimensions { clientRequestPath }
      }
      oldBlog: httpRequestsAdaptiveGroups(limit: 50, orderBy: [count_DESC],
        filter: { clientRequestHTTPHost: "${OLD_BLOG_HOST}", datetime_geq: $since, datetime_lt: $until }) {
        count dimensions { verifiedBotCategory }
      }
    } } }`,
    { ...vars, z: zone.id, ai: AI_CATEGORIES, files: DISCOVERY_FILES },
  );

  const pages = rum.viewer.accounts[0]?.pages ?? [];
  const z = http.viewer.zones[0];

  // ---------- shaping ----------

  const add = (map: Map<string, number>, key: string, n: number) => map.set(key, (map.get(key) ?? 0) + n);
  const sorted = (map: Map<string, number>, top = Infinity) =>
    [...map].sort((a, b) => b[1] - a[1]).slice(0, top).map(([key, count]) => ({ key, count }));

  const byGroup = new Map<string, number>();
  const byReferrer = new Map<string, number>();
  const byPage = new Map<string, number>();
  const byFoundPage = new Map<string, number>(); // landing pages reached from search engines or AI assistants
  let pageViews = 0;
  let visits = 0;
  for (const row of pages) {
    const { refererHost, requestPath } = row.dimensions;
    const group = referrerGroup(refererHost);
    pageViews += row.count;
    visits += row.sum?.visits ?? 0;
    add(byGroup, group, row.count);
    if (refererHost && group !== 'This site') add(byReferrer, refererHost, row.count);
    add(byPage, requestPath, row.count);
    if (group === 'Search engine' || group === 'AI assistant') add(byFoundPage, `${requestPath}  (${group.toLowerCase()})`, row.count);
  }

  const byCrawler = new Map<string, number>();
  const byRole = new Map<string, number>();
  for (const row of z.agents) {
    const crawler = CRAWLERS.find((c) => c.re.test(row.dimensions.userAgent));
    if (!crawler) continue;
    add(byCrawler, crawler.name, row.count);
    add(byRole, crawler.role, row.count);
  }

  const aiByPath = new Map<string, number>();
  const aiByType = new Map<string, number>();
  for (const row of z.aiPaths) {
    add(aiByPath, row.dimensions.clientRequestPath, row.count);
    add(aiByType, row.dimensions.edgeResponseContentTypeName || 'none', row.count);
  }

  const sampled = [...pages, ...z.categories].some((r) => (r.avg?.sampleInterval ?? 1) > 1);

  const report: Report = {
    host: HOST,
    from: vars.since,
    to: vars.until,
    sampled,
    people: {
      pageViews,
      visits,
      byReferrerGroup: sorted(byGroup),
      topReferrers: sorted(byReferrer, 15),
      topPages: sorted(byPage, 15),
      pagesFoundThroughSearchOrAi: sorted(byFoundPage, 15),
    },
    crawlers: {
      byCloudflareCategory: z.categories.map((r) => ({ key: r.dimensions.verifiedBotCategory || 'Not a verified bot', count: r.count })),
      byRole: sorted(byRole),
      named: sorted(byCrawler),
    },
    aiAgents: {
      byContentType: sorted(aiByType),
      topPaths: sorted(aiByPath, 15),
    },
    discoveryFiles: DISCOVERY_FILES.map((path) => ({
      key: path,
      count: z.files.find((r) => r.dimensions.clientRequestPath === path)?.count ?? 0,
    })),
    oldBlog: z.oldBlog.map((r) => ({ key: r.dimensions.verifiedBotCategory || 'Not a verified bot', count: r.count })),
  };

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  print(report);
}

// ---------- printing ----------

type Counted = { key: string; count: number }[];

type Report = {
  host: string;
  from: string;
  to: string;
  sampled: boolean;
  people: { pageViews: number; visits: number; byReferrerGroup: Counted; topReferrers: Counted; topPages: Counted; pagesFoundThroughSearchOrAi: Counted };
  crawlers: { byCloudflareCategory: Counted; byRole: Counted; named: Counted };
  aiAgents: { byContentType: Counted; topPaths: Counted };
  discoveryFiles: Counted;
  oldBlog: Counted;
};

function table(title: string, rows: Counted, note?: string) {
  console.log(`\n${title}`);
  if (note) console.log(`  ${note}`);
  if (!rows.length) return console.log('  (none)');
  const width = Math.min(70, Math.max(...rows.map((r) => r.key.length)));
  for (const r of rows) console.log(`  ${r.key.padEnd(width)}  ${String(r.count).padStart(7)}`);
}

function print(r: Report) {
  const day = (iso: string) => iso.slice(0, 16).replace('T', ' ');
  console.log(`Traffic report for ${r.host}, ${day(r.from)} to ${day(r.to)} UTC`);
  if (r.sampled) console.log('Cloudflare sampled some of this period, so the counts are estimates.');

  console.log(`\nPEOPLE (Web Analytics): ${r.people.pageViews} page views, ${r.people.visits} visits`);
  table('Where they came from', r.people.byReferrerGroup, 'AI apps often send no referrer, so AI visits are under-counted here.');
  table('Top referring sites', r.people.topReferrers);
  table('Pages people found through search or AI', r.people.pagesFoundThroughSearchOrAi);
  table('Top pages', r.people.topPages);

  console.log('\nCRAWLERS (requests at the edge)');
  table("Cloudflare's verified bot categories", r.crawlers.byCloudflareCategory);
  table('Named crawlers by role', r.crawlers.byRole, '"Fetch for a user" = an AI assistant reading the page to answer someone now.');
  table('Named crawlers', r.crawlers.named);

  console.log('\nWHAT AI AGENTS READ (AI Crawler, AI Assistant and AI Search)');
  table('By content type', r.aiAgents.byContentType, '"md" = the Markdown copies (index.html.md or Accept: text/markdown).');
  table('Top paths', r.aiAgents.topPaths);

  table('Discovery files (all requesters)', r.discoveryFiles);
  table(`Old blog (${OLD_BLOG_HOST}, answered by the redirect Worker)`, r.oldBlog);
  console.log('\nRankings, search queries and impressions are in Google Search Console and Bing Webmaster Tools.');
}

await main();
