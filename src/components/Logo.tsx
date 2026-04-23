"use client";

/**
 * OVERLOAD wordmark. Three variants:
 *   - mark: the bar-chart icon alone (3 ascending bars in blue → white → orange)
 *   - wordmark: type-only
 *   - full: mark + wordmark horizontal
 *
 * Geometry mirrors the PWA icon in scripts/gen-icons.mjs.
 */

export function LogoMark({ size = 24 }: { size?: number }) {
  const s = size;
  const pad = Math.round(s * 0.08);
  const inner = s - pad * 2;
  const barW = Math.max(2, Math.round(inner * 0.22));
  const gap = Math.max(1, Math.round(inner * 0.08));
  const groupW = barW * 3 + gap * 2;
  const startX = pad + Math.round((inner - groupW) / 2);
  const baseY = pad + Math.round(inner * 0.94);
  const maxH = Math.round(inner * 0.86);
  const h1 = Math.round(maxH * 0.42);
  const h2 = Math.round(maxH * 0.68);
  const h3 = maxH;
  const baselineW = Math.max(1, Math.round(inner * 0.04));

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <rect
        x={startX}
        y={baseY}
        width={groupW}
        height={baselineW}
        fill="var(--info)"
      />
      <rect x={startX} y={baseY - h1} width={barW} height={h1} fill="var(--info)" />
      <rect
        x={startX + barW + gap}
        y={baseY - h2}
        width={barW}
        height={h2}
        fill="var(--fg)"
      />
      <rect
        x={startX + (barW + gap) * 2}
        y={baseY - h3}
        width={barW}
        height={h3}
        fill="var(--accent)"
      />
    </svg>
  );
}

export function LogoWordmark({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-baseline font-black uppercase"
      style={{
        fontFamily: "var(--font-display)",
        fontSize: size,
        letterSpacing: "-0.04em",
        lineHeight: 1,
      }}
    >
      OVERLOAD
    </span>
  );
}

export function Logo({ size = 20 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size + 4} />
      <LogoWordmark size={size} />
    </span>
  );
}
