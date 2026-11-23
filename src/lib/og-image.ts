import satori from 'satori';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const NAVY = '#0b1c2f';
const PINK = '#ffb1a4';
const MUTED = '#a9abd2';
const INK = '#eceaf7';

let montserrat800: Buffer | undefined;
async function loadFont(): Promise<Buffer> {
  if (!montserrat800) {
    // Not `new URL(..., import.meta.url)`: Astro's build bundles/moves this module away
    // from its source directory without copying the font alongside it, so a path relative
    // to the compiled file's own location breaks. `astro build` always runs from the
    // project root, so a cwd-relative path is the stable one.
    montserrat800 = await readFile(join(process.cwd(), 'src/assets/fonts/montserrat-800.ttf'));
  }
  return montserrat800;
}

export interface OgImageOptions {
  eyebrow?: string;
  title: string;
  meta?: string;
  chips?: string[];
}

/** Picks a title size that leaves room for a long real title without the auto-shrink ever looking cramped. */
function titleFontSize(title: string): number {
  if (title.length <= 30) return 64;
  if (title.length <= 55) return 52;
  if (title.length <= 85) return 44;
  return 36;
}

function brandMark() {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 30, fontWeight: 800 },
      children: [
        { type: 'span', props: { style: { color: INK }, children: 'Hack' } },
        {
          type: 'span',
          props: {
            style: { background: PINK, color: NAVY, padding: '2px 10px', borderRadius: 4 },
            children: 'Make',
          },
        },
        { type: 'span', props: { style: { color: INK }, children: 'Do' } },
      ],
    },
  };
}

function chipEl(label: string) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        color: INK,
        fontSize: 18,
        fontWeight: 700,
        border: `2px solid #5a5f8f`,
        borderRadius: 20,
        padding: '8px 18px',
      },
      children: label,
    },
  };
}

function buildTree(options: OgImageOptions) {
  const { eyebrow, title, meta, chips } = options;

  const topChildren: unknown[] = [brandMark()];
  if (eyebrow) {
    topChildren.push({
      type: 'div',
      props: {
        style: { color: PINK, fontSize: 24, fontWeight: 800, letterSpacing: 2, marginTop: 50 },
        children: eyebrow.toUpperCase(),
      },
    });
  }
  topChildren.push({
    type: 'div',
    props: {
      style: {
        color: INK,
        fontSize: titleFontSize(title),
        fontWeight: 800,
        lineHeight: 1.15,
        marginTop: eyebrow ? 16 : 50,
        display: 'flex',
      },
      children: title,
    },
  });

  const bottomChildren: unknown[] = [];
  if (meta || (chips && chips.length)) {
    const footerLeft: unknown[] = [];
    if (meta) {
      footerLeft.push({
        type: 'div',
        props: { style: { color: MUTED, fontSize: 24, fontWeight: 700, marginBottom: 16 }, children: meta },
      });
    }
    if (chips && chips.length) {
      footerLeft.push({
        type: 'div',
        props: { style: { display: 'flex', gap: 14 }, children: chips.map(chipEl) },
      });
    }
    bottomChildren.push({
      type: 'div',
      props: { style: { display: 'flex', flexDirection: 'column' }, children: footerLeft },
    });
  } else {
    bottomChildren.push({ type: 'div', props: { children: '' } });
  }
  bottomChildren.push({
    type: 'div',
    props: { style: { color: MUTED, fontSize: 22, fontWeight: 700 }, children: 'hackmakedo.com' },
  });

  return {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        background: NAVY,
        fontFamily: 'Montserrat',
      },
      children: [
        { type: 'div', props: { style: { height: 10, background: PINK, display: 'flex' } } },
        {
          type: 'div',
          props: {
            style: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 80 },
            children: [
              { type: 'div', props: { style: { display: 'flex', flexDirection: 'column' }, children: topChildren } },
              {
                type: 'div',
                props: { style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }, children: bottomChildren },
              },
            ],
          },
        },
      ],
    },
  };
}

export async function renderOgImage(options: OgImageOptions): Promise<Buffer> {
  const font = await loadFont();
  const svg = await satori(buildTree(options) as never, {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Montserrat', data: font, weight: 800, style: 'normal' }],
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
