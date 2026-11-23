import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

import { type GeoPoint } from '@/types/report';

export type TrackingState = {
  point: GeoPoint | null;
  accuracyM: number | null;
  permission: 'unknown' | 'granted' | 'denied';
  error: string | null;
};

/**
 * Foreground tracking only. Used for the map "you are here" dot and the hazard
 * geofence, never as the source of truth for a report fix.
 */
export function useLocationTracking(enabled = true): TrackingState & { request: () => Promise<void> } {
  const [state, setState] = useState<TrackingState>({
    point: null,
    accuracyM: null,
    permission: 'unknown',
    error: null,
  });

  const request = useCallback(async () => {
    const services = await Location.hasServicesEnabledAsync();
    if (!services) {
      setState((s) => ({ ...s, error: 'Layanan lokasi mati. Nyalakan GPS untuk melihat posisi.' }));
      return;
    }
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      setState((s) => ({ ...s, permission: 'denied', error: 'Izin lokasi ditolak.' }));
      return;
    }
    setState((s) => ({ ...s, permission: 'granted', error: null }));
    const last = await Location.getLastKnownPositionAsync({ maxAge: 120_000 });
    if (last) {
      setState((s) => ({
        ...s,
        point: { latitude: last.coords.latitude, longitude: last.coords.longitude },
        accuracyM: last.coords.accuracy ?? null,
      }));
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        if (!cancelled) setState((s) => ({ ...s, permission: permission.status === 'denied' ? 'denied' : 'unknown' }));
        return;
      }
      setState((s) => ({ ...s, permission: 'granted' }));
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 25, timeInterval: 15_000 },
        (position) => {
          setState((s) => ({
            ...s,
            point: { latitude: position.coords.latitude, longitude: position.coords.longitude },
            accuracyM: position.coords.accuracy ?? null,
            error: null,
          }));
        },
      );
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled]);

  return { ...state, request };
}
