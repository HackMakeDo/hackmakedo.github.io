#!/usr/bin/env node
/**
 * One-off pass over public/images/blog/: resizes anything wider than MAX_WIDTH and
 * recompresses in its own format (mozjpeg for JPEG, imagequant for PNG, the GIF
 * encoder for GIF - animated GIFs keep all their frames via {animated: true}).
 * Prints each file's old/new size and final pixel dimensions, the latter for
 * stamping width/height onto the <img> tags in the post Markdown by hand.
 *
 * Run: node content/optimize-images.mjs
 */
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..', 'public', 'images', 'blog');
const MAX_WIDTH = 1400;
const MIN_SIZE_TO_TOUCH = 150 * 1024; // skip files already small enough

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function fmtKB(bytes) {
  return `${Math.round(bytes / 1024)}KB`;
}

async function main() {
  const results = [];
  for await (const file of walk(ROOT)) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) continue;

    const before = (await stat(file)).size;
    if (before < MIN_SIZE_TO_TOUCH) continue;

    const animated = ext === '.gif';
    const sharpOpts = { animated, limitInputPixels: false };
    const image = sharp(file, sharpOpts);
    const meta = await image.metadata();
    const needsResize = (meta.width ?? 0) > MAX_WIDTH;

    let pipeline = sharp(file, sharpOpts);
    if (needsResize) pipeline = pipeline.resize({ width: MAX_WIDTH });

    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 78, mozjpeg: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ quality: 80, palette: true });
    } else if (ext === '.gif') {
      pipeline = pipeline.gif({ effort: 7 });
    }

    const buffer = await pipeline.toBuffer();
    const after = buffer.length;
    const newMeta = await sharp(buffer, sharpOpts).metadata();

    if (after < before) {
      await sharp(buffer, sharpOpts).toFile(file);
      results.push({
        file: path.relative(ROOT, file),
        before,
        after,
        width: newMeta.width,
        height: newMeta.height,
      });
    }
  }

  results.sort((a, b) => b.before - a.before);
  let totalBefore = 0;
  let totalAfter = 0;
  for (const r of results) {
    totalBefore += r.before;
    totalAfter += r.after;
    console.log(
      `${fmtKB(r.before).padStart(7)} -> ${fmtKB(r.after).padStart(7)}  ${r.width}x${r.height}  ${r.file}`,
    );
  }
  console.log(`\n${results.length} files optimized, ${fmtKB(totalBefore)} -> ${fmtKB(totalAfter)}`);
}

main();
