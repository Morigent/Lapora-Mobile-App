import { create } from 'zustand';

import { type LocationFailure } from '@/features/location/services/locationService';
import { type CaptureSession, type ReportCreationStatus } from '@/types/report';

export type LocationFailureRecord = LocationFailure;

type CameraState = {
  status: ReportCreationStatus;
  session: CaptureSession | null;
  error: string | null;
  /** Why the shutter could not get a fix; read by /report/gps-failed. */
  locationFailure: LocationFailureRecord | null;
  setStatus: (status: ReportCreationStatus) => void;
  setSession: (session: CaptureSession | null) => void;
  confirmSession: () => void;
  setError: (error: string | null) => void;
  setLocationFailure: (failure: LocationFailureRecord | null) => void;
  reset: () => void;
};

export const useCameraStore = create<CameraState>((set, get) => ({
  status: 'idle',
  session: null,
  error: null,
  locationFailure: null,

  setStatus: (status) => set({ status }),

  setSession: (session) =>
    set({
      session,
      status: session ? 'preview' : 'idle',
      error: null,
    }),

  confirmSession: () => {
    const session = get().session;
    if (!session) return;
    set({ session: { ...session, confirmed: true }, status: 'ready_to_submit' });
  },

  setError: (error) => set({ error, status: error ? 'error' : get().status }),

  setLocationFailure: (locationFailure) => set({ locationFailure }),

  reset: () => set({ status: 'idle', session: null, error: null, locationFailure: null }),
}));
