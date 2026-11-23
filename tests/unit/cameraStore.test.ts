import { useCameraStore } from '@/stores/cameraStore';
import { type CaptureSession } from '@/types/report';

const SESSION: CaptureSession = {
  id: 'cap_1a2b3c',
  photoUri: 'file:///lapora-evidence/1.jpg',
  photoWidth: 1080,
  photoHeight: 1440,
  photoBytes: 13_000,
  confirmed: false,
  createdAt: '2026-11-22T12:00:00.000Z',
  metadata: {
    point: { latitude: -7.7956, longitude: 110.3695 },
    accuracyM: 6,
    locationMeasuredAt: '2026-11-22T12:00:00.000Z',
    capturedAt: '2026-11-22T12:00:00.000Z',
    source: 'gps',
  },
};

beforeEach(() => useCameraStore.getState().reset());

describe('cameraStore', () => {
  it('moves to preview when a capture session exists and back to idle when cleared', () => {
    useCameraStore.getState().setSession(SESSION);
    expect(useCameraStore.getState()).toMatchObject({ status: 'preview', session: SESSION, error: null });

    useCameraStore.getState().setSession(null);
    expect(useCameraStore.getState()).toMatchObject({ status: 'idle', session: null });
  });

  it('cannot confirm a location without a capture', () => {
    useCameraStore.getState().confirmSession();
    expect(useCameraStore.getState().status).toBe('idle');
  });

  it('confirms the session immutably and allows submission', () => {
    useCameraStore.getState().setSession(SESSION);
    useCameraStore.getState().confirmSession();

    const state = useCameraStore.getState();
    expect(state.status).toBe('ready_to_submit');
    expect(state.session?.confirmed).toBe(true);
    expect(state.session).not.toBe(SESSION);
  });

  it('surfaces an error state and keeps the previous status once cleared', () => {
    useCameraStore.getState().setSession(SESSION);
    useCameraStore.getState().setError('Lokasi belum terkunci');
    expect(useCameraStore.getState()).toMatchObject({ status: 'error', error: 'Lokasi belum terkunci' });

    useCameraStore.getState().setError(null);
    expect(useCameraStore.getState()).toMatchObject({ status: 'error', error: null });
  });
});
