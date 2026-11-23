import { type GeoPoint } from '@/types/report';

const EARTH_RADIUS_M = 6_371_000;

export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) return '—';
  const roundedM = Math.round(meters / 10) * 10;
  if (roundedM < 1000) return `${roundedM} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

export function formatAccuracy(meters: number | null): string {
  if (meters == null || !Number.isFinite(meters)) return 'tanpa akurasi';
  return `±${Math.round(meters)} m`;
}
