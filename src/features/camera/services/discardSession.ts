import { type CaptureSession } from '@/types/report';

export type DiscardRequest = {
  /** The capture being abandoned. A missing session still clears the store. */
  session: CaptureSession | null;
  /** Clears the camera store first, so no screen can resurrect the session. */
  reset: () => void;
  deletePhoto: (path: string) => Promise<void>;
  /** Extra store work that must happen after the reset (e.g. mark 'cancelled'). */
  afterReset?: () => void;
};

/**
 * The single exit path from the capture flow (README FR-15, FR-23): the session
 * is dropped and the photo leaves app storage, so a cancelled report never
 * leaves the citizen's picture behind. Navigation stays with the caller.
 */
export async function discardSession(request: DiscardRequest): Promise<void> {
  const uri = request.session?.photoUri ?? null;
  request.reset();
  request.afterReset?.();
  if (uri) await request.deletePhoto(uri);
}
