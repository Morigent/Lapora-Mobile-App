import * as Crypto from 'expo-crypto';
import { useCallback, useRef, useState } from 'react';
import { type CameraView, useCameraPermissions } from 'expo-camera';

import { runCapture, type CaptureOutcome } from '@/features/camera/services/captureFlow';
import { getFreshFix } from '@/features/location/services/locationService';
import { useCameraStore } from '@/stores/cameraStore';
import { storeCapturedPhoto } from '@/storage/photoStorage';

/**
 * The only way a CaptureSession comes into existence. Both the photo and the
 * GPS fix are produced from this in-app camera press; there is no gallery path.
 * The flow itself lives in services/captureFlow so it can be tested headlessly.
 */
export function useReportCamera() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const store = useCameraStore;

  const openPermission = useCallback(async () => {
    store.getState().setStatus('requesting_permission');
    const result = await requestPermission();
    if (result?.granted) {
      store.getState().setStatus('opening_camera');
      return true;
    }
    return false;
  }, [requestPermission, store]);

  const capture = useCallback(async (): Promise<CaptureOutcome> => {
    if (busy) return { ok: false, error: { code: 'busy', message: 'Tunggu proses foto sebelumnya.' } };
    const camera = cameraRef.current;
    if (!camera) {
      return { ok: false, error: { code: 'no_camera', message: 'Kamera belum siap. Coba lagi sebentar.' } };
    }

    setBusy(true);
    store.getState().setStatus('capturing');

    const outcome = await runCapture({
      takePicture: () => camera.takePictureAsync({ quality: 0.72, skipProcessing: false }),
      storePhoto: storeCapturedPhoto,
      getFix: () => {
        store.getState().setStatus('getting_location');
        return getFreshFix();
      },
      newId: () => `cap_${Crypto.randomUUID()}`,
      shutterAt: Date.now(),
    });

    if (outcome.ok) store.getState().setSession(outcome.session);
    else store.getState().setStatus('error');

    setBusy(false);
    return outcome;
  }, [busy, store]);

  return { cameraRef, permission, openPermission, capture, busy };
}
