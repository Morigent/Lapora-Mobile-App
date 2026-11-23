import { CATEGORY_LABEL } from '@/constants/reportMeta';
import { ACCURACY_HARD_LIMIT_M, ACCURACY_TARGET_M, CAPTURE_SESSION_TTL_MS } from '@/lib/constants';
import { type CaptureSession, type GeoPoint } from '@/types/report';
import { haversineMeters } from '@/utils/geo';

export type CaptureRejection =
  | { code: 'no_session'; message: string }
  | { code: 'expired'; message: string }
  | { code: 'not_confirmed'; message: string }
  | { code: 'stale_location'; message: string }
  | { code: 'location_too_inaccurate'; message: string; accuracyM: number }
  | { code: 'missing_photo'; message: string }
  | { code: 'not_in_app_capture'; message: string };

/**
 * FR-13/14: the submit gate. Every check reads the capture session, which only
 * the in-app camera screen can create.
 */
export function validateCaptureSession(
  session: CaptureSession | null,
  now = Date.now(),
): CaptureRejection | null {
  if (!session) {
    return { code: 'no_session', message: 'Tidak ada sesi foto. Ambil foto lewat kamera aplikasi.' };
  }
  if (!session.id || !session.id.startsWith('cap_')) {
    return {
      code: 'not_in_app_capture',
      message: 'Foto ini bukan dari sesi kamera aplikasi. Ambil ulang lewat kamera.',
    };
  }
  if (now - new Date(session.createdAt).getTime() > CAPTURE_SESSION_TTL_MS) {
    return { code: 'expired', message: 'Sesi foto sudah kedaluwarsa. Ambil ulang foto.' };
  }
  if (!session.confirmed) {
    return { code: 'not_confirmed', message: 'Konfirmasi lokasi dulu sebelum mengirim.' };
  }
  const measured = new Date(session.metadata.locationMeasuredAt).getTime();
  if (!Number.isFinite(measured) || Math.abs(now - measured) > CAPTURE_SESSION_TTL_MS) {
    return { code: 'stale_location', message: 'Lokasi tidak diukur pada sesi foto ini.' };
  }
  if (session.metadata.accuracyM == null || session.metadata.accuracyM > ACCURACY_HARD_LIMIT_M) {
    return {
      code: 'location_too_inaccurate',
      message: `Akurasi lokasi di atas ambang ${ACCURACY_HARD_LIMIT_M} m. Ambil ulang dari area terbuka.`,
      accuracyM: session.metadata.accuracyM ?? 999,
    };
  }
  if (!session.photoUri) {
    return { code: 'missing_photo', message: 'File foto tidak ditemukan. Ambil ulang foto.' };
  }
  return null;
}

export function accuracyTier(accuracyM: number | null): 'good' | 'coarse' | 'bad' {
  if (accuracyM == null) return 'bad';
  if (accuracyM <= ACCURACY_TARGET_M) return 'good';
  if (accuracyM <= ACCURACY_HARD_LIMIT_M) return 'coarse';
  return 'bad';
}

export function titleForCategory(categoryId: string, address: string | null): string {
  const label = CATEGORY_LABEL[categoryId] ?? 'Kerusakan';
  return address ? `${label} di ${address}` : label;
}

/** Screen 07 uses this distance to explain the mismatch. */
export function mismatchDistance(session: CaptureSession, fresh: GeoPoint): number {
  return haversineMeters(session.metadata.point, fresh);
}
