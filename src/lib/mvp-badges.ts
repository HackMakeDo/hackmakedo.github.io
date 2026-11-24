import type { ImageMetadata } from 'astro';

/**
 * The official Umbraco MVP badges, one per award year, as build-time images so Astro can
 * output sized WebP copies with a 1x/2x srcset. Look a badge up by year; a missing year
 * fails the build rather than showing a broken image.
 */
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/mvp/umbraco-mvp-*.png', { eager: true });

export function mvpBadge(year: number): ImageMetadata {
  const file = files[`../assets/mvp/umbraco-mvp-${year}.png`];
  if (!file) throw new Error(`No Umbraco MVP badge for ${year} in src/assets/mvp/`);
  return file.default;
}
