import { STORAGE_KEYS } from '@/lib/constants';
import { readJson, writeJson } from '@/storage/jsonStore';
import { type GeoPoint, type HazardZone } from '@/types/report';
import { haversineMeters } from '@/utils/geo';

const SEED_ZONES: HazardZone[] = [
  {
    id: 'zone-code',
    name: 'Bantaran Code',
    kind: 'Waspada banjir',
    radiusM: 800,
    center: { latitude: -7.8062, longitude: 110.3614 },
  },
  {
    id: 'zone-kaliurang',
    name: 'Kaliurang atas',
    kind: 'Longsor lereng',
    radiusM: 1200,
    center: { latitude: -7.7264, longitude: 110.4213 },
  },
];

async function readZones(): Promise<HazardZone[]> {
  const stored = await readJson<HazardZone[] | null>(STORAGE_KEYS.hazardZones, null);
  if (stored && stored.length > 0) return stored;
  await writeJson(STORAGE_KEYS.hazardZones, SEED_ZONES);
  return SEED_ZONES;
}

export async function listHazardZones(): Promise<HazardZone[]> {
  return readZones();
}

export type ZoneProximity = {
  zone: HazardZone;
  inside: boolean;
  distanceToCenterM: number;
  distanceToEdgeM: number;
};

export function zoneProximity(point: GeoPoint, zones: HazardZone[]): ZoneProximity[] {
  return zones
    .map((zone) => {
      const distanceToCenterM = haversineMeters(point, zone.center);
      return {
        zone,
        inside: distanceToCenterM <= zone.radiusM,
        distanceToCenterM,
        distanceToEdgeM: distanceToCenterM - zone.radiusM,
      };
    })
    .sort((a, b) => a.distanceToEdgeM - b.distanceToEdgeM);
}

/** Hazards are advisory only. Wording must never imply an official warning (§3.9). */
export function geofenceMessage(proximity: ZoneProximity[]): string {
  const inZone = proximity.find((item) => item.inside);
  if (inZone) return `Kamu di dalam ${inZone.zone.name}. Bukan peringatan resmi.`;
  const nearest = proximity[0];
  if (nearest && nearest.distanceToEdgeM <= 300) {
    return `Kamu dekat ${nearest.zone.name} · ${Math.round(nearest.distanceToEdgeM)} m dari batas. Bukan peringatan resmi.`;
  }
  return 'Kamu di luar zona rawan. Bukan peringatan resmi.';
}
