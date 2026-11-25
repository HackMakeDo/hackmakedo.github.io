/**
 * Weekly check of whether AI assistants name Warren when asked who to hire for Umbraco work.
 *
 *   npm run check:ai-answers                          ask every question on every assistant, then show the trend
 *   npm run check:ai-answers -- --only chatgpt,claude  just these assistants (ids below)
 *   npm run check:ai-answers -- --questions freelancer,upgrade
 *   npm run check:ai-answers -- --report               show the trend only
 *
 * You ask; the script records. For each question it copies the question to the clipboard and opens the
 * assistant (with the question filled in where the site allows it). Ask it, copy the whole answer with the
 * assistant's own copy button, come back and press Enter: the script reads the clipboard, scores the answer
 * and saves it. Type s then Enter to skip one. Answers are saved word for word, so they can be re-scored later.
 *
 * Why by hand: the assistants' terms forbid automating their chat pages, Perplexity won't answer anyone logged
 * out, and the APIs cost money. Ask logged out or in a private window where you can (or ChatGPT's temporary
 * chat), so answers aren't shaped by your own history. ChatGPT's memory knows who you are.
 *
 * Results stay on this machine, in ai-answers/ (git ignores it; the repo is public):
 *   ai-answers/results.csv               one row per answer
 *   ai-answers/<date>/<assistant>-<question>.md   the answer itself
 *
 * Piped input (not a terminal) is read instead of the clipboard, each answer ending with a line holding only
 * "." (or "s" to skip), and nothing is opened. Set AI_ANSWERS_DIR to keep results somewhere else.
 * Run with Node 22.18+ (it runs TypeScript directly). macOS: uses open, pbcopy and pbpaste.
 */
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

/** The ids are what results.csv records, so reword a question freely but keep its id (or the trend breaks). */
const QUESTIONS = [
  { id: 'freelancer', text: 'Who is a good Umbraco freelancer in the UK?' },
  { id: 'contractor', text: 'I need an Umbraco contractor in the UK. Who would you recommend?' },
  { id: 'upgrade', text: 'Who can upgrade our Umbraco 13 website to Umbraco 17? Recommend a specialist.' },
  { id: 'mvp', text: 'Can you recommend an Umbraco MVP who is available to hire?' },
  { id: 'backoffice', text: 'Who is an expert at building Umbraco backoffice extensions for the new Bellissima backoffice?' },
  // Not a ranking question: checks what they say about Warren (still at Umbraco HQ? still a Developer Advocate?).
  { id: 'who-is', text: 'Who is Warren Buckley, the Umbraco developer, and can I hire him?' },
];

/** `url` is opened with the question filled in; null where the site has no way to do that (paste it instead). */
const ASSISTANTS = [
  { id: 'chatgpt', name: 'ChatGPT', url: (q: string) => `https://chatgpt.com/?temporary-chat=true&q=${encodeURIComponent(q)}` },
  { id: 'perplexity', name: 'Perplexity', url: (q: string) => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}` },
  { id: 'google', name: 'Google AI Mode', url: (q: string) => `https://www.google.com/search?udm=50&q=${encodeURIComponent(q)}` },
  { id: 'gemini', name: 'Gemini', url: () => 'https://gemini.google.com/app' },
  { id: 'claude', name: 'Claude', url: (q: string) => `https://claude.ai/new?q=${encodeURIComponent(q)}` },
  { id: 'copilot', name: 'Microsoft Copilot', url: (q: string) => `https://copilot.microsoft.com/?q=${encodeURIComponent(q)}` },
];

const DIR = process.env.AI_ANSWERS_DIR ?? new URL('../ai-answers/', import.meta.url).pathname;
const CSV = `${DIR.replace(/\/$/, '')}/results.csv`;
const HEADER = 'date,assistant,question,named,position,listed,cited,stale\n';

const NAMED = /Warren Buckley|Hack ?Make ?Do/i;
const CITED = /hackmakedo\.com/i;
/** Out-of-date claims worth fixing at the source (profiles, the Umbraco HQ blog post). */
const STALE = /(works?|working) (at|for) Umbraco( HQ)?\b|currently at Umbraco|Developer Advocate at Umbraco|Umbraco HQ employee/i;
/** A recommendation item: a numbered or bulleted line, or a heading, at the start of a line. */
const ITEM = /^ {0,1}(?:\d+[.)]|[-*•]|#{2,4})\s+\S/;

type Score = { named: boolean; position: number | null; listed: number; cited: boolean; stale: boolean };

export function score(answer: string): Score {
  const items = answer.split('\n').filter((line) => ITEM.test(line));
  const index = items.findIndex((line) => NAMED.test(line));
  return {
    named: NAMED.test(answer),
    position: index === -1 ? null : index + 1,
    listed: items.length,
    cited: CITED.test(answer),
    stale: STALE.test(answer),
  };
}

function describe(s: Score): string {
  if (!s.named) return 'not named';
  const where = s.position ? `named, item ${s.position} of ${s.listed}` : 'named (not in a list)';
  return [where, s.cited && 'cites hackmakedo.com', s.stale && 'OUT OF DATE claim'].filter(Boolean).join(', ');
}

function pick<T extends { id: string }>(all: T[], flag: string): T[] {
  const i = process.argv.indexOf(flag);
  if (i === -1) return all;
  const ids = (process.argv[i + 1] ?? '').split(',');
  const unknown = ids.filter((id) => !all.some((x) => x.id === id));
  if (unknown.length) {
    console.error(`Unknown ${flag.slice(2)}: ${unknown.join(', ')}. Choose from: ${all.map((x) => x.id).join(', ')}`);
    process.exit(1);
  }
  return all.filter((x) => ids.includes(x.id));
}

/** Piped input: lines up to one holding only "." (the answer) or "s" (skip). */
async function* pipedAnswers(): AsyncGenerator<string | null> {
  const lines: string[] = [];
  for await (const line of createInterface({ input: process.stdin })) {
    if (line.trim() === '.' || line.trim() === 's') {
      yield line.trim() === 's' ? null : lines.join('\n');
      lines.length = 0;
    } else lines.push(line);
  }
}

async function ask() {
  const questions = pick(QUESTIONS, '--questions');
  const assistants = pick(ASSISTANTS, '--only');
  const interactive = process.stdin.isTTY;
  const date = new Date().toISOString().slice(0, 10);
  await mkdir(`${DIR}/${date}`, { recursive: true });
  if (!existsSync(CSV)) await writeFile(CSV, HEADER);

  const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;
  const piped = interactive ? null : pipedAnswers();
  let count = 0;
  let named = 0;

  for (const assistant of assistants) {
    console.log(`\n=== ${assistant.name} ===`);
    for (const question of questions) {
      console.log(`\n${question.id}: ${question.text}`);
      let answer: string | null;
      if (rl) {
        execFileSync('pbcopy', { input: question.text });
        execFileSync('open', [assistant.url(question.text)]);
        const reply = await rl.question('  Question copied and page opened. Copy the answer, then Enter (s to skip): ');
        answer = reply.trim().toLowerCase() === 's' ? null : execFileSync('pbpaste', { encoding: 'utf8' });
        if (answer?.trim() === question.text) {
          console.log('  The clipboard still holds the question, not the answer: skipped.');
          answer = null;
        }
      } else {
        answer = (await piped!.next()).value ?? null;
      }
      if (!answer?.trim()) {
        console.log('  skipped');
        continue;
      }
      const s = score(answer);
      await writeFile(`${DIR}/${date}/${assistant.id}-${question.id}.md`, `# ${assistant.name}: ${question.text}\n\n${date}\n\n${answer.trim()}\n`);
      await appendFile(CSV, [date, assistant.id, question.id, s.named, s.position ?? '', s.listed, s.cited, s.stale].join(',') + '\n');
      console.log(`  ${describe(s)}`);
      count++;
      if (s.named) named++;
    }
  }
  rl?.close();
  console.log(`\nNamed in ${named} of ${count} answers. Saved in ${DIR}`);
}

/** The last few runs per question and assistant: "#2/7" = item 2 of 7, "✓" = named outside a list, "·" = not named. */
async function report(runs = 6) {
  if (!existsSync(CSV)) {
    console.log('No results yet: run npm run check:ai-answers');
    return;
  }
  const rows = (await readFile(CSV, 'utf8')).trim().split('\n').slice(1).map((line) => {
    const [date, assistant, question, named, position, listed, cited, stale] = line.split(',');
    return { date, assistant, question, named: named === 'true', position, listed, cited: cited === 'true', stale: stale === 'true' };
  });
  const dates = [...new Set(rows.map((r) => r.date))].sort().slice(-runs);
  console.log(`\nAI answers, last ${dates.length} run(s). #n/m = item n of m listed, ✓ = named outside a list, · = not named, * = cites hackmakedo.com, ! = out-of-date claim`);
  for (const question of QUESTIONS) {
    const forQuestion = rows.filter((r) => r.question === question.id);
    if (!forQuestion.length) continue;
    console.log(`\n${question.id}: ${question.text}`);
    console.log(`  ${''.padEnd(18)}${dates.map((d) => d.slice(5).padEnd(9)).join('')}`);
    for (const assistant of ASSISTANTS) {
      const cells = dates.map((d) => {
        const r = forQuestion.findLast((x) => x.assistant === assistant.id && x.date === d); // a re-run that day wins
        if (!r) return '';
        const mark = !r.named ? '·' : r.position ? `#${r.position}/${r.listed}` : '✓';
        return `${mark}${r.cited ? '*' : ''}${r.stale ? '!' : ''}`;
      });
      if (cells.some(Boolean)) console.log(`  ${assistant.name.padEnd(18)}${cells.map((c) => (c || '-').padEnd(9)).join('')}`);
    }
  }
  console.log('');
  for (const d of dates) {
    const run = rows.filter((r) => r.date === d);
    console.log(`${d}: named in ${run.filter((r) => r.named).length} of ${run.length}, first in a list ${run.filter((r) => r.position === '1').length} times`);
  }
}

if (!process.argv.includes('--report')) await ask();
await report();
