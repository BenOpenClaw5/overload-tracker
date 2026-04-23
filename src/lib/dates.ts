export function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function formatDateShort(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
}

export function formatRelative(ts: number): string {
  const now = Date.now();
  const diffMs = now - ts;
  const s = Math.round(diffMs / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 14) return `${d}d ago`;
  const w = Math.round(d / 7);
  return `${w}w ago`;
}

export function newSessionId(): string {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
