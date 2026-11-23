import { captureMetadataFrom, type LocationResult } from '@/features/location/services/locationService';
import { PHOTO_MAX_BYTES } from '@/lib/constants';
import { type StoredPhoto } from '@/storage/photoStorage';
import { type CaptureSession } from '@/types/report';

export type CaptureFailure = { code: string; message: string };

export type CaptureOutcome = { ok: true; session: CaptureSession } | { ok: false; error: CaptureFailure };

/** Below this side length the shutter result is treated as a broken file. */
const MIN_PHOTO_SIDE = 240;

export type CaptureRequest = {
  takePicture: () => Promise<{ uri: string; width: number; height: number } | null>;
  storePhoto: (uri: string, width: number, height: number) => Promise<StoredPhoto>;
  /** Called after the photo is safe on disk; returns the GPS fix taken for this shutter. */
  getFix: () => Promise<LocationResult>;
  newId: () => string;
  /** Shutter timestamp in epoch ms, captured before the camera call. */
  shutterAt: number;
};

/**
 * The only path that produces a CaptureSession: in-app shutter → app storage →
 * GPS fix → immutable metadata (README FR-04…FR-08). No gallery input exists.
 */
export async function runCapture(request: CaptureRequest): Promise<CaptureOutcome> {
  let photo: { uri: string; width: number; height: number } | null;
  try {
    photo = await request.takePicture();
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'capture_failed',
        message: error instanceof Error ? error.message : 'Kamera gagal mengambil foto.',
      },
    };
  }

  if (!photo?.uri) {
    return { ok: false, error: { code: 'capture_failed', message: 'Kamera tidak menghasilkan file foto.' } };
  }
  if (photo.width < MIN_PHOTO_SIDE || photo.height < MIN_PHOTO_SIDE) {
    return { ok: false, error: { code: 'capture_failed', message: 'Hasil foto tidak valid. Ambil ulang.' } };
  }

  const stored = await request.storePhoto(photo.uri, photo.width, photo.height);
  if (stored.bytes > PHOTO_MAX_BYTES) {
    return {
      ok: false,
      error: { code: 'too_large', message: 'Foto di atas 8 MB. Ambil ulang dengan jarak lebih dekat.' },
    };
  }

  const fix = await request.getFix();
  if (!fix.ok) {
    return { ok: false, error: { code: fix.error.code, message: fix.error.message } };
  }

  return {
    ok: true,
    session: {
      id: request.newId(),
      photoUri: stored.path,
      photoWidth: stored.width,
      photoHeight: stored.height,
      photoBytes: stored.bytes,
      metadata: captureMetadataFrom(fix.fix, request.shutterAt),
      confirmed: false,
      createdAt: new Date().toISOString(),
    },
  };
}
