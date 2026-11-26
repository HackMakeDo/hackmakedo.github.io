/**
 * Keeps src/data/umbraco-versions.ts in sync with Umbraco's own support lifecycle table.
 *
 *   npm run check:umbraco-versions             compare; exits 1 if anything is missing or different
 *   npm run check:umbraco-versions -- --write  rewrite the list from Umbraco's page, then review the diff
 *
 * Released versions are written to UMBRACO_VERSIONS and announced ones to UMBRACO_UPCOMING (the upgrade
 * guide uses those to say what is coming); --write moves a version across once its release date has passed.
 * Run with Node 22.18+ (it runs TypeScript directly).
 */
import { readFile, writeFile } from 'node:fs/promises';
import {
  UMBRACO_VERSIONS,
  UMBRACO_UPCOMING,
  UMBRACO_LIFECYCLE_URL,
  type UmbracoVersion,
} from '../src/data/umbraco-versions.ts';

const DATA_FILE = new URL('../src/data/umbraco-versions.ts', import.meta.url);
const write = process.argv.includes('--write');
const today = new Date().toISOString().slice(0, 10);

const MONTHS: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

/** "Nov 27, 2025" -> "2025-11-27" */
function isoDate(text: string): string {
  const m = /^([A-Z][a-z]{2})[a-z]* (\d{1,2}), (\d{4})$/.exec(text);
  if (!m || !MONTHS[m[1]]) throw new Error(`Unexpected date "${text}"`);
  return `${m[3]}-${MONTHS[m[1]]}-${m[2].padStart(2, '0')}`;
}

/** Reads the table rows ("Umbraco 17 | Nov 27, 2025 | LTS | Nov 27, 2027 | Nov 27, 2028") from the page text. */
function parseLifecycle(html: string): UmbracoVersion[] {
  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const rows = new Map<number, UmbracoVersion>();
  lines.forEach((line, i) => {
    const m = /^Umbraco (\d+)$/.exec(line);
    if (!m) return;
    const [released, type, securityPhase, endOfLife] = lines.slice(i + 1, i + 5);
    try {
      rows.set(Number(m[1]), {
        version: Number(m[1]),
        type: type === 'LTS' || type === 'STS' ? type : null,
        released: isoDate(released),
        securityPhase: isoDate(securityPhase),
        endOfLife: isoDate(endOfLife),
      });
    } catch {
      // "Umbraco 17" also appears in headings and links; only table rows are followed by dates.
    }
  });
  return [...rows.values()].sort((a, b) => b.version - a.version);
}

const same = (a: UmbracoVersion, b: UmbracoVersion) =>
  a.type === b.type && a.released === b.released && a.securityPhase === b.securityPhase && a.endOfLife === b.endOfLife;

const describe = (v: UmbracoVersion) =>
  `Umbraco ${v.version}${v.type ? ` (${v.type})` : ''}: released ${v.released}, security fixes only from ${v.securityPhase}, end of life ${v.endOfLife}`;

const res = await fetch(UMBRACO_LIFECYCLE_URL, { headers: { 'User-Agent': 'Mozilla/5.0 (version check)' } });
if (!res.ok) {
  console.error(`Could not load ${UMBRACO_LIFECYCLE_URL} (HTTP ${res.status}).`);
  process.exit(2);
}
const source = parseLifecycle(await res.text());
if (source.length < 5) {
  console.error(`Found only ${source.length} versions on Umbraco's page; its layout may have changed. Check it by hand:\n${UMBRACO_LIFECYCLE_URL}`);
  process.exit(2);
}

const released = source.filter((v) => v.released <= today);
const upcoming = source.filter((v) => v.released > today).sort((a, b) => a.version - b.version);
const ours = new Map(UMBRACO_VERSIONS.map((v) => [v.version, v]));

const problems: string[] = [];
for (const v of released) {
  const mine = ours.get(v.version);
  if (!mine) problems.push(`Missing: ${describe(v)}`);
  else if (!same(mine, v)) problems.push(`Different: Umbraco ${v.version}\n    Umbraco says: ${describe(v)}\n    site has:     ${describe(mine)}`);
}
for (const v of UMBRACO_VERSIONS) {
  if (!released.some((s) => s.version === v.version)) problems.push(`Not on Umbraco's page (or not released yet): Umbraco ${v.version}`);
}
const oursUpcoming = new Map(UMBRACO_UPCOMING.map((v) => [v.version, v]));
for (const v of upcoming) {
  const mine = oursUpcoming.get(v.version);
  if (!mine) problems.push(`Missing upcoming: ${describe(v)}`);
  else if (!same(mine, v)) problems.push(`Different upcoming: Umbraco ${v.version}\n    Umbraco says: ${describe(v)}\n    site has:     ${describe(mine)}`);
}
for (const v of UMBRACO_UPCOMING) {
  if (!upcoming.some((s) => s.version === v.version)) problems.push(`No longer upcoming (released, or dropped from Umbraco's page): Umbraco ${v.version}`);
}

console.log(`Umbraco's page: ${released.length} released versions, ${upcoming.length} upcoming.`);
for (const v of upcoming) console.log(`  Upcoming: ${describe(v)}`);

/** Replaces the generated lines between `// <name:start>` and `// <name:end>` in the data file. */
function replaceBlock(file: string, name: string, versions: UmbracoVersion[]): string {
  const from = file.indexOf(`  // <${name}:start>`);
  const to = file.indexOf(`  // <${name}:end>`);
  if (from < 0 || to < 0) throw new Error(`<${name}> markers not found in src/data/umbraco-versions.ts`);
  const startLine = file.slice(from, file.indexOf('\n', from) + 1);
  const entries = versions
    .map((v) =>
      `  { version: ${v.version}, type: ${v.type ? `'${v.type}'` : 'null'}, released: '${v.released}', securityPhase: '${v.securityPhase}', endOfLife: '${v.endOfLife}' },\n`,
    )
    .join('');
  return file.slice(0, from) + startLine + entries + file.slice(to);
}

if (write) {
  const file = await readFile(DATA_FILE, 'utf8');
  const updated = replaceBlock(replaceBlock(file, 'umbraco-versions', released), 'umbraco-upcoming', upcoming).replace(
    /export const UMBRACO_LIFECYCLE_CHECKED = '[\d-]+';/,
    `export const UMBRACO_LIFECYCLE_CHECKED = '${today}';`,
  );
  await writeFile(DATA_FILE, updated);
  console.log(
    problems.length
      ? `Updated src/data/umbraco-versions.ts (${problems.length} change${problems.length === 1 ? '' : 's'}) and the checked date. Review the diff before committing.`
      : 'Already in sync; updated the checked date to today.',
  );
  process.exit(0);
}

if (problems.length) {
  console.error(`\nOut of sync with Umbraco's page:\n  ${problems.join('\n  ')}\n\nRun: npm run check:umbraco-versions -- --write`);
  process.exit(1);
}
console.log('In sync with Umbraco\'s page.');
