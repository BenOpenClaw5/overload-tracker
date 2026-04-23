"use client";

interface Point {
  x: number;
  y: number;
}

export function Sparkline({
  values,
  width = 120,
  height = 36,
  stroke = "var(--info)",
  fill = "color-mix(in srgb, var(--info) 18%, transparent)",
  pointStroke = "var(--accent)",
  showLast = true,
}: {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  pointStroke?: string;
  showLast?: boolean;
}) {
  if (!values.length) {
    return (
      <svg width={width} height={height} aria-hidden>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="var(--border)"
          strokeDasharray="2 4"
        />
      </svg>
    );
  }
  const pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points: Point[] = values.map((v, i) => ({
    x: pad + ((width - pad * 2) * i) / Math.max(1, values.length - 1),
    y: height - pad - ((v - min) / range) * (height - pad * 2),
  }));
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
  const area = `${d} L${points[points.length - 1].x.toFixed(2)},${height - pad} L${points[0].x.toFixed(2)},${height - pad} Z`;
  const last = points[points.length - 1];
  return (
    <svg width={width} height={height} aria-hidden>
      <path d={area} fill={fill} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={1.5} fill={stroke} />
      ))}
      {showLast ? (
        <circle
          cx={last.x}
          cy={last.y}
          r={2.5}
          fill={pointStroke}
          stroke={pointStroke}
          strokeWidth="1"
        />
      ) : null}
    </svg>
  );
}
