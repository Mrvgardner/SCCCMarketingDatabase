#!/usr/bin/env node
// One-shot optimizer for display-only assets.
// Converts:
//   - public/wallpapers/images/MartixBeautyShots-*.png (display previews) -> WebP
//   - public/brochures/thumbnails/*.jpg                                    -> WebP
//   - public/pdfs/thumbnails/*.jpg                                         -> WebP
//   - public/logos/confluence-logo.jpg                                     -> WebP
//   - public/fonts/SWITCHCOMMERCE*.otf                                     -> .woff2
//
// Skipped on purpose (downloadable assets — leave at original quality):
//   - public/wallpapers/images/SC-Matrix-*.jpg
//   - public/brochures/*.pdf, public/pdfs/*.pdf, public/downloads/*
//   - public/signatures/images/*.jpg (embedded into outgoing emails)

import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import wawoff2 from 'wawoff2';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');

const WEBP_TARGETS = [
  // [glob-ish dir, max-width, quality]
  { dir: 'public/wallpapers/images', match: /^MartixBeautyShots-.*\.png$/i, maxW: 1280, quality: 78 },
  { dir: 'public/brochures/thumbnails', match: /\.(jpe?g|png)$/i, maxW: 320, quality: 80 },
  { dir: 'public/pdfs/thumbnails', match: /\.(jpe?g|png)$/i, maxW: 320, quality: 80 },
  { dir: 'public/logos', match: /^confluence-logo\.jpg$/i, maxW: 128, quality: 82 },
];

async function listMatching(dirRel, regex) {
  const dir = path.join(ROOT, dirRel);
  let entries;
  try { entries = await fs.readdir(dir); } catch { return []; }
  return entries.filter((f) => regex.test(f)).map((f) => path.join(dir, f));
}

async function toWebp(file, { maxW, quality }) {
  const img = sharp(file, { failOn: 'none' });
  const meta = await img.metadata();
  const out = file.replace(/\.(png|jpe?g)$/i, '.webp');
  const before = (await fs.stat(file)).size;

  let pipeline = img;
  if (meta.width && meta.width > maxW) {
    pipeline = pipeline.resize({ width: maxW, withoutEnlargement: true });
  }
  await pipeline.webp({ quality, effort: 5 }).toFile(out);

  const after = (await fs.stat(out)).size;
  const pct = ((1 - after / before) * 100).toFixed(0);
  console.log(`  ${path.relative(ROOT, file)}  ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB  (-${pct}%)`);
  return { before, after };
}

async function convertImages() {
  let savedTotal = 0;
  console.log('Converting display images to WebP…');
  for (const target of WEBP_TARGETS) {
    const files = await listMatching(target.dir, target.match);
    for (const file of files) {
      try {
        const { before, after } = await toWebp(file, target);
        savedTotal += before - after;
      } catch (err) {
        console.warn(`  ! skipped ${file}: ${err.message}`);
      }
    }
  }
  console.log(`Image savings: ${(savedTotal / 1024).toFixed(0)} KB`);
}

async function convertFonts() {
  console.log('\nConverting brand fonts to WOFF2…');
  const fontDir = path.join(ROOT, 'public/fonts');
  const files = (await fs.readdir(fontDir)).filter((f) => /\.otf$/i.test(f));
  let savedTotal = 0;
  for (const f of files) {
    const src = path.join(fontDir, f);
    const dst = src.replace(/\.otf$/i, '.woff2');
    const buf = await fs.readFile(src);
    const woff2 = await wawoff2.compress(buf);
    await fs.writeFile(dst, woff2);
    const before = buf.length;
    const after = woff2.length;
    savedTotal += before - after;
    const pct = ((1 - after / before) * 100).toFixed(0);
    console.log(`  ${path.relative(ROOT, src)}  ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB  (-${pct}%)`);
  }
  console.log(`Font savings: ${(savedTotal / 1024).toFixed(0)} KB`);
}

await convertImages();
await convertFonts();
console.log('\nDone.');
