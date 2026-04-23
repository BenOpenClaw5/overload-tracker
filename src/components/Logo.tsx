"use client";

/**
 * OVERLOAD wordmark. Three variants:
 *   - mark: the bar-chart icon alone (3 ascending bars in blue → white → orange)
 *   - wordmark: type-only
 *   - full: mark + wordmark horizontal
 */

export function LogoMark({
  size = 24,
  withBorder = true,
}: {
  size?: number;
  withBorder?: boolean;
}) {
  const s = size;
  const pad = 2;
  const inner = s - pad * 2;
  const barW = Math.max(2, Math.round(inner * 0.18));
  const gap = Math.max(1, Math.round(inner * 0.08));
  const baseY = pad + inner - Math.round(inner * 0.14);
  const b1H = Math.round(inner * 0.3);
  const b2H = Math.round(inner * 0.5);
  const b3H = Math.round(inner * 0.82);
  const xStart = pad + Math.round(inner * 0.1);

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      {withBorder ? (
        <rect
          x={0.5}
          y={0.5}
          width={s - 1}
          height={s - 1}
          fill="none"
          stroke="currentColor"
          opacity={0.35}
        />
      ) : null}
      {/* baseline */}
      <line
        x1={pad}
        y1={baseY + 2}
        x2={s - pad}
        y2={baseY + 2}
        stroke="var(--info)"
        strokeWidth="1"
      />
      {/* bar 1 — info blue */}
      <rect
        x={xStart}
        y={baseY - b1H}
        width={barW}
        height={b1H}
        fill="var(--info)"
      />
      {/* bar 2 — white */}
      <rect
        x={xStart + barW + gap}
        y={baseY - b2H}
        width={barW}
        height={b2H}
        fill="var(--fg)"
      />
      {/* bar 3 — accent orange (tallest = progressive overload) */}
      <rect
        x={xStart + (barW + gap) * 2}
        y={baseY - b3H}
        width={barW}
        height={b3H}
        fill="var(--accent)"
      />
    </svg>
  );
}

export function LogoWordmark({
  size = 20,
  compact = false,
}: {
  size?: number;
  compact?: boolean;
}) {
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
      <span>OVER</span>
      <span
        style={{ color: "var(--accent)", margin: compact ? "0 1px" : "0 2px" }}
      >
        /
      </span>
      <span>LOAD</span>
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
