import { type LocationFailure } from '@/features/location/services/locationService';
import { describeLocationFailure } from '@/features/location/services/locationFailureCopy';

describe('describeLocationFailure', () => {
  it('tells the citizen to open settings only when permission was denied', () => {
    expect(describeLocationFailure({ code: 'permission_denied', message: 'x' })).toMatchObject({
      heading: 'Izin lokasi ditolak',
      action: 'settings',
    });
    expect(describeLocationFailure({ code: 'services_disabled', message: 'x' })).toMatchObject({
      heading: 'Layanan lokasi mati',
      action: 'retry',
    });
    expect(describeLocationFailure({ code: 'timeout', message: 'x' })).toMatchObject({
      heading: 'GPS belum dapat titik',
      action: 'retry',
    });
  });

  it('never reports a GPS reading it did not measure', () => {
    const failures: (LocationFailure | null)[] = [
      { code: 'permission_denied', message: 'x' },
      { code: 'services_disabled', message: 'x' },
      { code: 'timeout', message: 'x' },
      null,
    ];
    for (const failure of failures) {
      const labels = describeLocationFailure(failure).rows.map((row) => row.label);
      expect(labels).toEqual(['Titik lokasi', 'Ambang tim']);
    }
  });

  it('falls back to an unknown cause when no failure was recorded', () => {
    const copy = describeLocationFailure(null);
    expect(copy.rows[0]).toEqual({ label: 'Titik lokasi', value: 'Tidak terekam' });
    expect(copy.heading).toBe('GPS gagal dibaca');
  });
});
