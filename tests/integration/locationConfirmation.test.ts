import { discardSession } from '@/features/camera/services/discardSession';
import { locationVerdict } from '@/features/location/services/locationConfirmation';
import { LOCATION_MISMATCH_M } from '@/lib/constants';
import { type CaptureSession } from '@/types/report';

const SESSION: CaptureSession = {
  id: 'cap_confirm',
  photoUri: 'file:///lapora-evidence/photo.jpg',
  photoWidth: 1080,
  photoHeight: 1440,
  photoBytes: 512_000,
  metadata: {
    point: { latitude: -7.7956, longitude: 110.3695 },
    accuracyM: 6,
    locationMeasuredAt: '2026-11-22T12:00:00.000Z',
    capturedAt: '2026-11-22T12:00:00.000Z',
    source: 'gps',
  },
  confirmed: false,
  createdAt: '2026-11-22T12:00:00.000Z',
};

describe('locationVerdict — confirm is unlocked only by an accepted mismatch (FR-11, FR-12)', () => {
  it('confirms straight away when the re-probe agrees with the photo pin', () => {
    const verdict = locationVerdict({ distanceM: 0 }, false);

    expect(verdict).toMatchObject({
      mismatched: false,
      needsAcknowledgement: false,
      canConfirm: true,
      heading: 'Konfirmasi lokasi',
    });
    expect(verdict.distanceM).toBe(0);
  });

  it('treats the tolerance itself as still inside it and one metre more as a mismatch', () => {
    expect(locationVerdict({ distanceM: LOCATION_MISMATCH_M }, false)).toMatchObject({
      mismatched: false,
      canConfirm: true,
    });
    expect(locationVerdict({ distanceM: LOCATION_MISMATCH_M + 1 }, false)).toMatchObject({
      mismatched: true,
      needsAcknowledgement: true,
      canConfirm: false,
      heading: 'Periksa lokasi',
    });
  });

  it('unlocks confirm only after the citizen explicitly keeps the photo pin', () => {
    const pending = locationVerdict({ distanceM: 480 }, false);
    expect(pending.canConfirm).toBe(false);

    const accepted = locationVerdict({ distanceM: 480 }, true);
    expect(accepted).toMatchObject({ mismatched: true, needsAcknowledgement: false, canConfirm: true });
    expect(accepted.distanceM).toBe(480);
  });

  it('keeps confirm locked while the re-probe is missing or failed', () => {
    expect(locationVerdict(null, false)).toMatchObject({ distanceM: 0, mismatched: false, canConfirm: true });
    expect(locationVerdict({ error: 'GPS belum dapat titik.' }, false)).toMatchObject({
      distanceM: 0,
      mismatched: false,
      canConfirm: true,
    });
  });
});

describe('discardSession — every exit removes the photo from app storage (FR-23)', () => {
  it('clears the store before deleting, then deletes exactly the session photo', async () => {
    const order: string[] = [];
    const deleted: string[] = [];

    await discardSession({
      session: SESSION,
      reset: () => order.push('reset'),
      deletePhoto: async (path) => {
        order.push('delete');
        deleted.push(path);
      },
    });

    expect(deleted).toEqual(['file:///lapora-evidence/photo.jpg']);
    expect(order).toEqual(['reset', 'delete']);
  });

  it('runs the after-reset hook between the reset and the delete', async () => {
    const order: string[] = [];

    await discardSession({
      session: SESSION,
      reset: () => order.push('reset'),
      afterReset: () => order.push('cancelled'),
      deletePhoto: async () => {
        order.push('delete');
      },
    });

    expect(order).toEqual(['reset', 'cancelled', 'delete']);
  });

  it('still resets when there is no session to delete', async () => {
    const reset = jest.fn();
    const deletePhoto = jest.fn(async () => undefined);

    await discardSession({ session: null, reset, deletePhoto });

    expect(reset).toHaveBeenCalledTimes(1);
    expect(deletePhoto).not.toHaveBeenCalled();
  });
});
