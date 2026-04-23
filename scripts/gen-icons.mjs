import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const BG = "#0A0A0A";
const FG = "#EAEAEA";
const ACCENT = "#FF3300";

function iconSvg(size, { maskable = false } = {}) {
  const pad = maskable ? Math.round(size * 0.12) : Math.round(size * 0.06);
  const inner = size - pad * 2;
  const barH = Math.max(4, Math.round(inner * 0.05));
  const textY = pad + Math.round(inner * 0.32);
  const bigY = pad + Math.round(inner * 0.66);
  const fsBig = Math.round(inner * 0.34);
  const fsSmall = Math.max(8, Math.round(inner * 0.07));
  const slashW = Math.round(inner * 0.08);
  const slashX1 = pad + Math.round(inner * 0.8);
  const slashY1 = pad + Math.round(inner * 0.18);
  const slashX2 = slashX1 - slashW * 2.6;
  const slashY2 = slashY1 + Math.round(inner * 0.5);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" fill="none" stroke="${FG}" stroke-width="${Math.max(2, Math.round(inner * 0.015))}"/>
  <line x1="${pad}" y1="${pad + Math.round(inner * 0.22)}" x2="${pad + inner}" y2="${pad + Math.round(inner * 0.22)}" stroke="${FG}" stroke-width="1" opacity="0.4"/>
  <line x1="${pad}" y1="${pad + inner - Math.round(inner * 0.18)}" x2="${pad + inner}" y2="${pad + inner - Math.round(inner * 0.18)}" stroke="${FG}" stroke-width="1" opacity="0.4"/>
  <line x1="${slashX1}" y1="${slashY1}" x2="${slashX2}" y2="${slashY2}" stroke="${ACCENT}" stroke-width="${slashW}" stroke-linecap="butt"/>
  <text x="${pad + Math.round(inner * 0.06)}" y="${textY}" font-family="monospace" font-weight="700" font-size="${fsSmall}" fill="${FG}" letter-spacing="2">UNIT/OL</text>
  <text x="${pad + Math.round(inner * 0.06)}" y="${bigY}" font-family="Arial Black, sans-serif" font-weight="900" font-size="${fsBig}" fill="${FG}" letter-spacing="-2">OL</text>
  <rect x="${pad + Math.round(inner * 0.06)}" y="${bigY + Math.round(fsBig * 0.22)}" width="${Math.round(inner * 0.38)}" height="${barH}" fill="${ACCENT}"/>
  <text x="${pad + inner - Math.round(inner * 0.06)}" y="${pad + inner - Math.round(inner * 0.06)}" font-family="monospace" font-weight="700" font-size="${fsSmall}" fill="${FG}" letter-spacing="2" text-anchor="end">REV 1.0</text>
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

async function writeFavicon() {
  const svg = iconSvg(64);
  const png = await sharp(Buffer.from(svg)).resize(64, 64).png().toBuffer();
  await writeFile(resolve("public", "favicon.png"), png);
  console.log("wrote favicon.png");
}

await writePng(192, "icon-192.png");
await writePng(512, "icon-512.png");
await writePng(512, "icon-maskable-512.png", { maskable: true });
await writePng(180, "apple-touch-icon.png");
await writeSvg(512, "icon.svg");
await writeFavicon();
