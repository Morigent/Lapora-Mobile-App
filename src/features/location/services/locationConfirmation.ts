import { LOCATION_MISMATCH_M } from '@/lib/constants';

/** Re-probe of the current GPS point against the photo's pin. */
export type LocationProbe = { distanceM: number } | { error: string } | null;

export type LocationVerdict = {
  /** Distance from the photo pin, 0 while unknown or errored. */
  distanceM: number;
  /** The re-probe disagrees with the pin by more than the tolerance. */
  mismatched: boolean;
  /** A mismatch the citizen has not yet accepted keeps confirm locked. */
  needsAcknowledgement: boolean;
  canConfirm: boolean;
  heading: string;
  explanation: string;
};

/**
 * Decide what the location-confirmation screen shows (README FR-11, FR-12).
 * A mismatch is never auto-accepted and the coordinates are never editable:
 * the citizen either keeps the photo's pin explicitly or takes the photo again.
 */
export function locationVerdict(
  probe: LocationProbe,
  accepted: boolean,
  thresholdM: number = LOCATION_MISMATCH_M,
): LocationVerdict {
  const distanceM = probe && 'distanceM' in probe ? probe.distanceM : 0;
  const mismatched = probe != null && 'distanceM' in probe && distanceM > thresholdM;
  const needsAcknowledgement = mismatched && !accepted;

  return {
    distanceM,
    mismatched,
    needsAcknowledgement,
    canConfirm: !needsAcknowledgement,
    heading: mismatched ? 'Periksa lokasi' : 'Konfirmasi lokasi',
    explanation: mismatched
      ? 'Lokasi sepertinya tidak tepat. Pastikan kamu mengambil foto di lokasi kerusakan, bukan dari dalam kendaraan.'
      : 'Lokasi pin sesuai dengan posisi GPS saat foto diambil. Konfirmasi untuk melanjutkan ke detail laporan.',
  };
}
