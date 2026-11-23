import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export type StoredPhoto = {
  path: string;
  bytes: number;
  width: number;
  height: number;
  mimeType: string;
};

/**
 * Copies a capture that already lives in the camera's cache into this app's own
 * document space (README FR-23 / §3.8.1). The public gallery is never touched.
 */
export async function storeCapturedPhoto(uri: string, width: number, height: number): Promise<StoredPhoto> {
  if (Platform.OS === 'web') {
    const bytes = await fetch(uri)
      .then((response) => response.blob())
      .then((blob) => blob.size)
      .catch(() => 0);
    return { path: uri, bytes, width, height, mimeType: 'image/jpeg' };
  }

  const directory = new FileSystem.Directory(FileSystem.Paths.document, 'lapora-evidence');
  if (!directory.exists) directory.create({ intermediates: true, idempotent: true });

  const source = new FileSystem.File(uri);
  const target = new FileSystem.File(directory, `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);
  await source.copy(target);

  return {
    path: target.uri,
    bytes: target.size,
    width,
    height,
    mimeType: 'image/jpeg',
  };
}

export async function deleteStoredPhoto(path: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const file = new FileSystem.File(path);
    if (file.exists) file.delete();
  } catch {
    // Evidence cleanup is best-effort; the report row is the source of truth.
  }
}

export function photoExists(path: string): boolean {
  if (Platform.OS === 'web') return Boolean(path);
  try {
    return new FileSystem.File(path).exists;
  } catch {
    return false;
  }
}
