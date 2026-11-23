import { runCapture, type CaptureRequest } from '@/features/camera/services/captureFlow';
import { LOCATION_FRESHNESS_MS } from '@/lib/constants';

const SHUTTER_AT = Date.parse('2026-11-22T12:00:00.000Z');

function request(overrides: Partial<CaptureRequest> = {}): CaptureRequest {
  return {
    takePicture: async () => ({ uri: 'file:///cache/photo.jpg', width: 1080, height: 1440 }),
    storePhoto: async (uri, width, height) => ({
      path: uri.replace('/cache/', '/lapora-evidence/'),
      bytes: 512_000,
      width,
      height,
      mimeType: 'image/jpeg',
    }),
    getFix: async () => ({
      ok: true,
      fix: {
        point: { latitude: -7.7956, longitude: 110.3695 },
        accuracyM: 6,
        measuredAt: new Date(SHUTTER_AT).toISOString(),
        ageMs: 400,
      },
    }),
    newId: () => 'cap_test',
    shutterAt: SHUTTER_AT,
    ...overrides,
  };
}

describe('runCapture — the only capture path (FR-04…FR-08)', () => {
  it('builds an unconfirmed session that points at app storage, not the camera cache', async () => {
    const outcome = await runCapture(request());

    if (!outcome.ok) throw new Error(outcome.error.message);
    expect(outcome.session).toMatchObject({
      id: 'cap_test',
      photoUri: 'file:///lapora-evidence/photo.jpg',
      photoWidth: 1080,
      photoHeight: 1440,
      photoBytes: 512_000,
      confirmed: false,
    });
    expect(outcome.session.metadata).toEqual({
      point: { latitude: -7.7956, longitude: 110.3695 },
      accuracyM: 6,
      locationMeasuredAt: new Date(SHUTTER_AT).toISOString(),
      capturedAt: new Date(SHUTTER_AT).toISOString(),
      source: 'gps',
    });
  });

  it('marks a fix older than a third of the freshness window as cached', async () => {
    const outcome = await runCapture(
      request({
        getFix: async () => ({
          ok: true,
          fix: {
            point: { latitude: -7.7956, longitude: 110.3695 },
            accuracyM: 9,
            measuredAt: new Date(SHUTTER_AT - 6_000).toISOString(),
            ageMs: LOCATION_FRESHNESS_MS / 2,
          },
        }),
      }),
    );

    if (!outcome.ok) throw new Error(outcome.error.message);
    expect(outcome.session.metadata.source).toBe('cached');
    expect(outcome.session.metadata.capturedAt).toBe(new Date(SHUTTER_AT).toISOString());
  });

  it('rejects a shutter that produced no usable photo', async () => {
    expect(await runCapture(request({ takePicture: async () => null }))).toEqual({
      ok: false,
      error: { code: 'capture_failed', message: 'Kamera tidak menghasilkan file foto.' },
    });
    expect(
      await runCapture(request({ takePicture: async () => ({ uri: 'file:///x.jpg', width: 200, height: 1440 }) })),
    ).toEqual({
      ok: false,
      error: { code: 'capture_failed', message: 'Hasil foto tidak valid. Ambil ulang.' },
    });
  });

  it('turns a camera exception into a readable failure', async () => {
    const outcome = await runCapture(
      request({
        takePicture: async () => {
          throw new Error('Kamera sedang dipakai aplikasi lain.');
        },
      }),
    );

    expect(outcome).toEqual({ ok: false, error: { code: 'capture_failed', message: 'Kamera sedang dipakai aplikasi lain.' } });
  });

  it('rejects oversized evidence before asking for a GPS fix', async () => {
    const getFix = jest.fn();
    const outcome = await runCapture(
      request({
        storePhoto: async (uri, width, height) => ({
          path: uri,
          bytes: 9 * 1024 * 1024,
          width,
          height,
          mimeType: 'image/jpeg',
        }),
        getFix,
      }),
    );

    if (outcome.ok) throw new Error('expected too_large');
    expect(outcome.error.code).toBe('too_large');
    expect(getFix).not.toHaveBeenCalled();
  });

  it.each([
    ['permission_denied', 'Izin lokasi ditolak.'],
    ['services_disabled', 'Layanan lokasi perangkat sedang mati.'],
    ['timeout', 'GPS belum dapat titik.'],
  ])('propagates a %s location failure so the screen can explain it', async (code, message) => {
    const outcome = await runCapture(
      request({
        getFix: async () => ({ ok: false, error: { code: code as 'timeout', message } }),
      }),
    );

    expect(outcome).toEqual({ ok: false, error: { code, message } });
  });
});
