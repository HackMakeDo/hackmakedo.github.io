/**
 * Checks the JSON-LD on the key pages with the Schema Markup Validator (validator.schema.org, run by Google).
 *
 *   npm run check:structured-data            the built pages in dist/ (run npm run build first)
 *   npm run check:structured-data -- --live  the same pages on https://hackmakedo.com
 *
 * Exits 1 if any page has an error. This checks schema.org correctness, not Google's rich-result eligibility:
 * for that, paste a live URL into https://search.google.com/test/rich-results.
 * Run with Node 22.18+ (it runs TypeScript directly).
 */
import { readFile } from 'node:fs/promises';

export {};

const SITE = 'https://hackmakedo.com';
const VALIDATOR = 'https://validator.schema.org/validate';
/** One of each page type with structured data. */
const PAGES = [
  '/',
  '/about/',
  '/umbraco-freelancer/',
  '/umbraco-contractor/',
  '/umbraco-upgrades/',
  '/contact/',
  '/work/',
  '/blog/',
  '/blog/my-first-umbraco-bellissima-package/',
];

const live = process.argv.includes('--live');

type Node = {
  types?: { value: string; errors?: unknown[] }[];
  errors?: unknown[];
  properties?: { pred: string; errors?: unknown[] }[];
  nodeProperties?: { pred: string; target: Node }[];
};
type Result = { totalNumErrors?: number; totalNumWarnings?: number; tripleGroups?: { nodes: Node[] }[] };

async function validate(path: string): Promise<Result> {
  const body = live
    ? new URLSearchParams({ url: `${SITE}${path}` })
    : new URLSearchParams({ html: await readFile(new URL(`../dist${path}index.html`, import.meta.url), 'utf8') });
  const res = await fetch(VALIDATOR, { method: 'POST', body });
  if (!res.ok) throw new Error(`The validator answered ${res.status} for ${path}`);
  const text = await res.text();
  return JSON.parse(text.slice(text.indexOf('{'))) as Result; // the response starts with an anti-JSON-hijacking prefix
}

/** Every type found, and every error message with where it was found. */
function walk(node: Node, types: Set<string>, errors: string[], where = '') {
  for (const t of node.types ?? []) {
    types.add(t.value);
    for (const e of t.errors ?? []) errors.push(`${t.value}: ${JSON.stringify(e)}`);
  }
  for (const e of node.errors ?? []) errors.push(`${where || 'node'}: ${JSON.stringify(e)}`);
  for (const p of node.properties ?? []) for (const e of p.errors ?? []) errors.push(`${p.pred}: ${JSON.stringify(e)}`);
  for (const p of node.nodeProperties ?? []) walk(p.target, types, errors, p.pred);
}

let failed = 0;
console.log(`Structured data on ${live ? SITE : 'dist/'} (validator.schema.org)\n`);
for (const path of PAGES) {
  const result = await validate(path);
  const types = new Set<string>();
  const errors: string[] = [];
  for (const group of result.tripleGroups ?? []) for (const node of group.nodes) walk(node, types, errors);
  const errorCount = result.totalNumErrors ?? errors.length;
  if (errorCount) failed++;
  console.log(`${errorCount ? '✗' : '✓'} ${path.padEnd(45)} ${errorCount} errors, ${result.totalNumWarnings ?? 0} warnings`);
  console.log(`    ${[...types].sort().join(', ')}`);
  for (const e of errors) console.log(`    ${e}`);
}

if (failed) {
  console.error(`\n${failed} page(s) with errors.`);
  process.exit(1);
}
console.log('\nNo errors. For Google rich-result eligibility: https://search.google.com/test/rich-results');
