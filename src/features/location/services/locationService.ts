import * as Location from 'expo-location';

import { ACCURACY_HARD_LIMIT_M, LOCATION_FRESHNESS_MS, LOCATION_TIMEOUT_MS } from '@/lib/constants';
import { type CaptureMetadata, type GeoPoint } from '@/types/report';

export type LocationFix = {
  point: GeoPoint;
  accuracyM: number | null;
  measuredAt: string;
  ageMs: number;
};

export type LocationFailure =
  | { code: 'services_disabled'; message: string }
  | { code: 'permission_denied'; message: string }
  | { code: 'timeout'; message: string };

export type LocationResult = { ok: true; fix: LocationFix } | { ok: false; error: LocationFailure };

function toFix(position: Location.LocationObject, now: number): LocationFix {
  const measuredAt = new Date(position.timestamp || now).toISOString();
  return {
    point: { latitude: position.coords.latitude, longitude: position.coords.longitude },
    accuracyM: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
    measuredAt,
    ageMs: Math.abs(now - new Date(measuredAt).getTime()),
  };
}

function isUsable(fix: LocationFix): boolean {
  return fix.ageMs <= LOCATION_FRESHNESS_MS && (fix.accuracyM ?? Infinity) <= ACCURACY_HARD_LIMIT_M;
}

export async function requestLocationPermission(): Promise<LocationFailure | null> {
  const services = await Location.hasServicesEnabledAsync();
  if (!services) {
    return {
      code: 'services_disabled',
      message: 'Layanan lokasi perangkat sedang mati. Nyalakan GPS lalu coba lagi.',
    };
  }
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) {
    return {
      code: 'permission_denied',
      message: 'Izin lokasi ditolak. Tanpa lokasi, laporan tidak bisa dikirim.',
    };
  }
  return null;
}

/**
 * A fix is only legitimate for a report when it was measured around the shutter
 * press (README FR-06/07/08). A cached fix is surfaced through `ageMs` and the
 * preview screen states it honestly instead of pretending it is live.
 */
export async function getFreshFix(timeoutMs = LOCATION_TIMEOUT_MS): Promise<LocationResult> {
  const permissionError = await requestLocationPermission();
  if (permissionError) return { ok: false, error: permissionError };

  const startedAt = Date.now();
  let best = await Location.getLastKnownPositionAsync({ maxAge: 60_000 });
  if (best) {
    const cached = toFix(best, Date.now());
    if (isUsable(cached)) return { ok: true, fix: cached };
  }

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        mayShowUserSettingsDialog: true,
      });
      const fix = toFix(position, Date.now());
      if (isUsable(fix)) return { ok: true, fix };
      best = position;
    } catch {
      // GPS warm-up refusal: keep polling until the deadline.
    }
    const remaining = timeoutMs - (Date.now() - startedAt);
    if (remaining <= 0) break;
    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, Math.min(900, remaining));
    await promise;
  }

  if (best) return { ok: true, fix: toFix(best, Date.now()) };
  return {
    ok: false,
    error: {
      code: 'timeout',
      message: 'GPS belum dapat titik. Pindah ke area terbuka lalu coba lagi.',
    },
  };
}

export function captureMetadataFrom(fix: LocationFix, shutterAt = Date.now()): CaptureMetadata {
  return {
    point: fix.point,
    accuracyM: fix.accuracyM,
    locationMeasuredAt: fix.measuredAt,
    capturedAt: new Date(shutterAt).toISOString(),
    source: fix.ageMs > LOCATION_FRESHNESS_MS / 3 ? 'cached' : 'gps',
  };
}

export async function reverseGeocode(point: GeoPoint): Promise<string | null> {
  try {
    const [first] = await Location.reverseGeocodeAsync(point);
    if (!first) return null;
    const parts = [first.district ?? first.subregion, first.city, first.region].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  } catch {
    return null;
  }
}
