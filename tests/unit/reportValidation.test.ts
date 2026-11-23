import {
  accuracyTier,
  mismatchDistance,
  titleForCategory,
  validateCaptureSession,
} from '@/features/camera/services/evidenceGate';
import { geofenceMessage, zoneProximity } from '@/features/hazards/services/hazardService';
import { CAPTURE_SESSION_TTL_MS } from '@/lib/constants';
import { type CaptureSession, type HazardZone } from '@/types/report';

const NOW = new Date('2026-11-22T12:00:00.000Z').getTime();

function session(overrides: Partial<CaptureSession> = {}, metadata: Partial<CaptureSession['metadata']> = {}): CaptureSession {
  return {
    id: 'cap_1a2b3c',
    photoUri: 'file:///lapora-evidence/1.jpg',
    photoWidth: 1080,
    photoHeight: 1440,
    photoBytes: 13_000,
    confirmed: true,
    createdAt: new Date(NOW - 60_000).toISOString(),
    metadata: {
      point: { latitude: -7.7956, longitude: 110.3695 },
      accuracyM: 6,
      locationMeasuredAt: new Date(NOW - 60_000).toISOString(),
      capturedAt: new Date(NOW - 60_000).toISOString(),
      source: 'gps',
      ...metadata,
    },
    ...overrides,
  };
}

describe('validateCaptureSession — FR-13/14 submit gate', () => {
  it('accepts a confirmed in-app capture with a fresh, accurate fix', () => {
    expect(validateCaptureSession(session(), NOW)).toBeNull();
  });

  it('rejects a missing session', () => {
    expect(validateCaptureSession(null, NOW)?.code).toBe('no_session');
  });

  it('rejects a photo that did not come from the in-app camera session', () => {
    expect(validateCaptureSession(session({ id: 'gallery-42' }), NOW)?.code).toBe('not_in_app_capture');
    expect(validateCaptureSession(session({ id: '' }), NOW)?.code).toBe('not_in_app_capture');
  });

  it('rejects an expired session', () => {
    const old = new Date(NOW - CAPTURE_SESSION_TTL_MS - 1).toISOString();
    expect(validateCaptureSession(session({ createdAt: old }), NOW)?.code).toBe('expired');
  });

  it('rejects an unconfirmed location (FR-11)', () => {
    expect(validateCaptureSession(session({ confirmed: false }), NOW)?.code).toBe('not_confirmed');
  });

  it('rejects a location that was not measured on this capture', () => {
    const stale = new Date(NOW - CAPTURE_SESSION_TTL_MS - 1).toISOString();
    expect(
      validateCaptureSession(session({}, { locationMeasuredAt: stale }), NOW)?.code,
    ).toBe('stale_location');
    expect(
      validateCaptureSession(session({}, { locationMeasuredAt: 'bukan-tanggal' }), NOW)?.code,
    ).toBe('stale_location');
  });

  it('rejects missing and coarse accuracy past the 50 m hard limit', () => {
    expect(
      validateCaptureSession(session({}, { accuracyM: null }), NOW)?.code,
    ).toBe('location_too_inaccurate');
    expect(
      validateCaptureSession(session({}, { accuracyM: 51 }), NOW)?.code,
    ).toBe('location_too_inaccurate');
    expect(validateCaptureSession(session({}, { accuracyM: 50 }), NOW)).toBeNull();
  });

  it('rejects a session whose photo file is gone', () => {
    expect(validateCaptureSession(session({ photoUri: '' }), NOW)?.code).toBe('missing_photo');
  });
});

describe('accuracyTier', () => {
  it('tiers around the 25 m target and 50 m hard limit', () => {
    expect(accuracyTier(0)).toBe('good');
    expect(accuracyTier(25)).toBe('good');
    expect(accuracyTier(25.1)).toBe('coarse');
    expect(accuracyTier(50)).toBe('coarse');
    expect(accuracyTier(50.1)).toBe('bad');
    expect(accuracyTier(null)).toBe('bad');
  });
});

describe('geofence', () => {
  const ZONE: HazardZone = {
    id: 'zone-code',
    name: 'Bantaran Code',
    kind: 'Waspada banjir',
    radiusM: 800,
    center: { latitude: -7.8062, longitude: 110.3614 },
  };
  const inside = { latitude: -7.8062, longitude: 110.3614 };

  it('marks points inside the radius', () => {
    const [result] = zoneProximity(inside, [ZONE]);
    expect(result.inside).toBe(true);
    expect(result.distanceToEdgeM).toBeLessThan(0);
  });

  it('orders zones by distance to their edge', () => {
    const far: HazardZone = { ...ZONE, id: 'zone-far', center: { latitude: -7.9, longitude: 110.6 } };
    const proximity = zoneProximity(inside, [far, ZONE]);
    expect(proximity.map((item) => item.zone.id)).toEqual(['zone-code', 'zone-far']);
  });

  it('never words the advisory as an official warning (§3.9)', () => {
    const messages = [
      geofenceMessage(zoneProximity(inside, [ZONE])),
      geofenceMessage(zoneProximity({ latitude: -7.8062 + 0.009, longitude: 110.3614 }, [ZONE])),
      geofenceMessage(zoneProximity({ latitude: -7.7, longitude: 110.7 }, [ZONE])),
    ];
    expect(messages[0]).toContain('Bukan peringatan resmi');
    expect(messages[1]).toContain('Bukan peringatan resmi');
    expect(messages[2]).toBe('Kamu di luar zona rawan. Bukan peringatan resmi.');
  });
});

describe('mismatchDistance — screen 07 mismatch warning', () => {
  it('measures the drift between the photo pin and a fresh fix', () => {
    const drift = mismatchDistance(session(), { latitude: -7.8062, longitude: 110.3695 });
    expect(drift).toBeGreaterThan(1_100);
    expect(drift).toBeLessThan(1_250);
  });

  it('reports zero when the pin and the fresh fix agree', () => {
    const pinned = session();
    expect(mismatchDistance(pinned, pinned.metadata.point)).toBe(0);
  });
});

describe('titleForCategory', () => {
  it('combines the category label with the street when known', () => {
    expect(titleForCategory('pothole', 'Jl. Malioboro')).toBe('Jalan berlubang di Jl. Malioboro');
    expect(titleForCategory('pothole', null)).toBe('Jalan berlubang');
  });

  it('falls back to a generic noun for an unknown category', () => {
    expect(titleForCategory('unknown-id', null)).toBe('Kerusakan');
  });
});
