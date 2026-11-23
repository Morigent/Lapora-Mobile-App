const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

const pad = (n: number) => String(n).padStart(2, '0');

/** 14 Nov 2026 */
export function formatDate(iso: string | number | Date): string {
  const d = toDate(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** 09:41 */
export function formatTime(iso: string | number | Date): string {
  const d = toDate(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 09:41:22 */
export function formatClock(iso: string | number | Date): string {
  const d = toDate(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** 14 Nov 2026 · 09:41:22 */
export function formatStamp(iso: string | number | Date): string {
  return `${formatDate(iso)} · ${formatClock(iso)}`;
}

/** 14 Nov · 09:41 */
export function formatShortStamp(iso: string | number | Date): string {
  const d = toDate(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} · ${formatTime(d)}`;
}

/** 2 jam lalu · kemarin · 3 hari lalu */
export function formatRelative(iso: string | number | Date, now = Date.now()): string {
  const diffMin = Math.max(0, Math.round((now - toDate(iso).getTime()) / 60_000));
  if (diffMin < 1) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const hours = Math.round(diffMin / 60);
  if (hours < 20) return `${hours} jam lalu`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'kemarin';
  if (days < 30) return `${days} hari lalu`;
  return formatDate(iso);
}

/** −7.79564, 110.36955 */
export function formatCoordinates(latitude: number, longitude: number): string {
  const fmt = (v: number) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(5);
  return `${fmt(latitude)}, ${fmt(longitude)}`;
}

function toDate(value: string | number | Date): Date {
  return value instanceof Date ? value : new Date(value);
}
