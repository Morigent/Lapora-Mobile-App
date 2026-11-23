import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { type GeoPoint, type HazardZone } from '@/types/report';

import { geofenceMessage, listHazardZones, zoneProximity } from '../services/hazardService';

export type GeofenceState = {
  zones: HazardZone[];
  message: string;
  inside: boolean;
  nearest: { zone: HazardZone; distanceToEdgeM: number } | null;
};

/**
 * Foreground-only geofence (§3.9 allows this for the project scope). Wording is
 * always advisory: "Bukan peringatan resmi".
 */
export function useHazardGeofence(point: GeoPoint | null): GeofenceState {
  const [zones, setZones] = useState<HazardZone[]>([]);
  const [active, setActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    let cancelled = false;
    listHazardZones().then((rows) => {
      if (!cancelled) setZones(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    return () => subscription.remove();
  }, []);

  return useMemo(() => {
    if (!active || !point || zones.length === 0) {
      return { zones, message: 'Geofence aktif hanya saat aplikasi terbuka.', inside: false, nearest: null };
    }
    const proximity = zoneProximity(point, zones);
    const first = proximity[0];
    return {
      zones: proximity.map((item) => item.zone),
      message: geofenceMessage(proximity),
      inside: proximity.some((item) => item.inside),
      nearest: first ? { zone: first.zone, distanceToEdgeM: first.distanceToEdgeM } : null,
    };
  }, [active, point, zones]);
}
