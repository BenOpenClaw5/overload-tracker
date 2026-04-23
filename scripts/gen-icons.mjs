import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const BG = "#070709";
const FG = "#F2F2F2";
const ACCENT = "#FF6A00";
const INFO = "#2E7BFF";

/**
 * Minimal icon: three ascending bars on black.
 *   blue (shortest)  -> white (mid)  -> orange (tallest)
 * With a thin baseline tying them together. No text.
 *
 * maskable=true widens safe padding so the mark survives the iOS/Android
 * rounded mask crop.
 */
function iconSvg(size, { maskable = false } = {}) {
  const pad = maskable ? Math.round(size * 0.22) : Math.round(size * 0.14);
  const inner = size - pad * 2;

  // Three bars: equal width, even gaps, ascending heights
  const barW = Math.round(inner * 0.22);
  const gap = Math.round(inner * 0.08);
  const groupW = barW * 3 + gap * 2;
  const startX = pad + Math.round((inner - groupW) / 2);

  // Leave ~8% of inner for baseline breathing room
  const baseY = pad + Math.round(inner * 0.94);
  const maxH = Math.round(inner * 0.86);
  const h1 = Math.round(maxH * 0.42);
  const h2 = Math.round(maxH * 0.68);
  const h3 = maxH;

  const baselineW = Math.max(2, Math.round(inner * 0.018));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>

  <!-- thin blue baseline running full width of the group -->
  <rect x="${startX}" y="${baseY}" width="${groupW}" height="${baselineW}" fill="${INFO}"/>

  <!-- bars -->
  <rect x="${startX}" y="${baseY - h1}" width="${barW}" height="${h1}" fill="${INFO}"/>
  <rect x="${startX + barW + gap}" y="${baseY - h2}" width="${barW}" height="${h2}" fill="${FG}"/>
  <rect x="${startX + (barW + gap) * 2}" y="${baseY - h3}" width="${barW}" height="${h3}" fill="${ACCENT}"/>
</svg>`;
}

async function writePng(size, filename, opts) {
  const svg = iconSvg(size, opts);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(resolve("public", filename), png);
  console.log(`wrote ${filename} (${size}x${size})`);
}

async function writeSvg(size, filename, opts) {
  const svg = iconSvg(size, opts);
  await writeFile(resolve("public", filename), svg);
  console.log(`wrote ${filename}`);
}

await writePng(192, "icon-192.png");
await writePng(512, "icon-512.png");
await writePng(512, "icon-maskable-512.png", { maskable: true });
await writePng(180, "apple-touch-icon.png");
await writeSvg(512, "icon.svg");

// favicon — same mark, smaller
const favPng = await sharp(Buffer.from(iconSvg(64))).resize(64, 64).png().toBuffer();
await writeFile(resolve("public", "favicon.png"), favPng);
console.log("wrote favicon.png");
