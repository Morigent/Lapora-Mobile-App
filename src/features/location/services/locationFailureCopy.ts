import { ACCURACY_HARD_LIMIT_M } from '@/lib/constants';

import { type LocationFailure } from './locationService';

export type FailureRow = { label: string; value: string };

export type LocationFailureCopy = {
  heading: string;
  body: string;
  rows: FailureRow[];
  tips: string[];
  /** Permission failures can only be fixed in OS settings. */
  action: 'settings' | 'retry';
  actionLabel: string;
};

const COPY: Record<LocationFailure['code'], Omit<LocationFailureCopy, 'rows'>> = {
  permission_denied: {
    heading: 'Izin lokasi ditolak',
    body: 'Lapora tidak bisa melaporkan tanpa titik lokasi. Izinkan akses lokasi untuk aplikasi ini, lalu ambil foto lagi.',
    tips: ['Buka Pengaturan HP', 'Aplikasi → Lapora', 'Izin → Lokasi → Izinkan'],
    action: 'settings',
    actionLabel: 'Buka pengaturan izin',
  },
  services_disabled: {
    heading: 'Layanan lokasi mati',
    body: 'GPS perangkat sedang tidak aktif. Nyalakan lokasi, lalu ambil foto lagi dari area terbuka.',
    tips: ['Nyalakan lokasi perangkat', 'Pilih mode presisi tinggi', 'Tunggu 5–10 detik sebelum menekan shutter'],
    action: 'retry',
    actionLabel: 'Coba Ambil Lokasi',
  },
  timeout: {
    heading: 'GPS belum dapat titik',
    body: 'Titik GPS tidak didapat dalam batas waktu. Lokasi harus diukur pada sesi foto ini, jadi foto tidak disimpan.',
    tips: ['Keluar ke area terbuka', 'Hindari berada di dalam gedung', 'Tunggu 5–10 detik sebelum menekan shutter'],
    action: 'retry',
    actionLabel: 'Coba Ambil Lokasi',
  },
};

/**
 * Copy for the GPS-failure screen. Every row is derived from the real failure —
 * the screen never invents a signal or accuracy value it did not measure.
 */
export function describeLocationFailure(failure: LocationFailure | null): LocationFailureCopy {
  const base = failure ? COPY[failure.code] : null;
  const rows: FailureRow[] = [
    { label: 'Titik lokasi', value: 'Tidak terekam' },
    { label: 'Ambang tim', value: `±${ACCURACY_HARD_LIMIT_M} m` },
  ];
  if (!base) {
    return {
      heading: 'GPS gagal dibaca',
      body: 'Tidak ada catatan kegagalan lokasi dari sesi foto ini. Ambil foto ulang lewat kamera aplikasi.',
      rows,
      tips: ['Ambil foto lewat kamera aplikasi', 'Pastikan lokasi perangkat menyala', 'Coba lagi dari area terbuka'],
      action: 'retry',
      actionLabel: 'Coba Ambil Lokasi',
    };
  }
  return { ...base, rows };
}
