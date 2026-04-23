import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const BG = "#070709";
const FG = "#F2F2F2";
const ACCENT = "#FF6A00";
const INFO = "#2E7BFF";

function iconSvg(size, { maskable = false } = {}) {
  const pad = maskable ? Math.round(size * 0.14) : Math.round(size * 0.07);
  const inner = size - pad * 2;

  const barW = Math.round(inner * 0.19);
  const gap = Math.round(inner * 0.06);
  const baseY = pad + Math.round(inner * 0.78);
  const b1H = Math.round(inner * 0.3);
  const b2H = Math.round(inner * 0.5);
  const b3H = Math.round(inner * 0.72);
  const barsX = pad + Math.round(inner * 0.09);

  const topLabelSize = Math.max(9, Math.round(inner * 0.06));
  const wordSize = Math.round(inner * 0.2);
  const footerSize = Math.max(8, Math.round(inner * 0.055));

  const strokeW = Math.max(2, Math.round(inner * 0.015));
  const baselineY = baseY + Math.round(inner * 0.01);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>

  <!-- outer frame -->
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" fill="none" stroke="${FG}" stroke-width="${strokeW}"/>

  <!-- top meta bar -->
  <line x1="${pad}" y1="${pad + Math.round(inner * 0.15)}" x2="${pad + inner}" y2="${pad + Math.round(inner * 0.15)}" stroke="${FG}" stroke-width="1" opacity="0.35"/>
  <text x="${pad + Math.round(inner * 0.05)}" y="${pad + Math.round(inner * 0.11)}" font-family="JetBrains Mono, Menlo, monospace" font-weight="700" font-size="${topLabelSize}" fill="${FG}" letter-spacing="${Math.round(topLabelSize * 0.14)}" opacity="0.75">UNIT / OL</text>
  <text x="${pad + inner - Math.round(inner * 0.05)}" y="${pad + Math.round(inner * 0.11)}" font-family="JetBrains Mono, Menlo, monospace" font-weight="700" font-size="${topLabelSize}" fill="${INFO}" letter-spacing="${Math.round(topLabelSize * 0.14)}" text-anchor="end">REV 2.0</text>

  <!-- baseline -->
  <line x1="${pad + Math.round(inner * 0.06)}" y1="${baselineY}" x2="${pad + inner - Math.round(inner * 0.06)}" y2="${baselineY}" stroke="${INFO}" stroke-width="${Math.max(1, Math.round(inner * 0.008))}"/>

  <!-- three ascending bars -->
  <rect x="${barsX}" y="${baseY - b1H}" width="${barW}" height="${b1H}" fill="${INFO}"/>
  <rect x="${barsX + barW + gap}" y="${baseY - b2H}" width="${barW}" height="${b2H}" fill="${FG}"/>
  <rect x="${barsX + (barW + gap) * 2}" y="${baseY - b3H}" width="${barW}" height="${b3H}" fill="${ACCENT}"/>

  <!-- upward diagonal cue (progressive overload arrow) -->
  <line x1="${barsX + Math.round(barW / 2)}" y1="${baseY - b1H - Math.round(inner * 0.02)}" x2="${barsX + (barW + gap) * 2 + Math.round(barW / 2)}" y2="${baseY - b3H - Math.round(inner * 0.02)}" stroke="${ACCENT}" stroke-width="${Math.max(1, Math.round(inner * 0.01))}" opacity="0.9"/>

  <!-- OL wordmark (right side) -->
  <text x="${pad + inner - Math.round(inner * 0.07)}" y="${pad + Math.round(inner * 0.5)}" font-family="Archivo Black, Arial Black, sans-serif" font-weight="900" font-size="${wordSize}" fill="${FG}" letter-spacing="-${Math.max(1, Math.round(wordSize * 0.05))}" text-anchor="end">OVER</text>
  <text x="${pad + inner - Math.round(inner * 0.07)}" y="${pad + Math.round(inner * 0.5) + Math.round(wordSize * 0.95)}" font-family="Archivo Black, Arial Black, sans-serif" font-weight="900" font-size="${wordSize}" fill="${FG}" letter-spacing="-${Math.max(1, Math.round(wordSize * 0.05))}" text-anchor="end">LOAD</text>
  <!-- orange slash marker next to OVER -->
  <rect x="${pad + inner - Math.round(inner * 0.07) - Math.round(wordSize * 2.4)}" y="${pad + Math.round(inner * 0.5) - Math.round(wordSize * 0.55)}" width="${Math.round(wordSize * 0.12)}" height="${Math.round(wordSize * 0.75)}" fill="${ACCENT}" transform="rotate(20 ${pad + inner - Math.round(inner * 0.07) - Math.round(wordSize * 2.4)} ${pad + Math.round(inner * 0.5) - Math.round(wordSize * 0.55)})"/>

  <!-- footer divider + label -->
  <line x1="${pad}" y1="${pad + inner - Math.round(inner * 0.1)}" x2="${pad + inner}" y2="${pad + inner - Math.round(inner * 0.1)}" stroke="${FG}" stroke-width="1" opacity="0.35"/>
  <text x="${pad + Math.round(inner * 0.05)}" y="${pad + inner - Math.round(inner * 0.035)}" font-family="JetBrains Mono, Menlo, monospace" font-weight="700" font-size="${footerSize}" fill="${FG}" letter-spacing="${Math.round(footerSize * 0.14)}" opacity="0.75">PROGRESSIVE OVERLOAD</text>
  <rect x="${pad + inner - Math.round(inner * 0.16)}" y="${pad + inner - Math.round(inner * 0.065)}" width="${Math.round(inner * 0.1)}" height="${Math.max(2, Math.round(inner * 0.016))}" fill="${ACCENT}"/>
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

// favicon — simplified (no text, just the bars on BG)
const favSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${BG}"/>
  <line x1="8" y1="50" x2="56" y2="50" stroke="${INFO}" stroke-width="2"/>
  <rect x="12" y="35" width="10" height="15" fill="${INFO}"/>
  <rect x="26" y="25" width="10" height="25" fill="${FG}"/>
  <rect x="40" y="12" width="10" height="38" fill="${ACCENT}"/>
</svg>`;
const favPng = await sharp(Buffer.from(favSvg)).resize(64, 64).png().toBuffer();
await writeFile(resolve("public", "favicon.png"), favPng);
console.log("wrote favicon.png");
