import {
  clearDraft,
  dismissDraft,
  readDraft,
  saveDraft,
  submitReport,
  type SubmitInput,
} from '@/features/reports/services/reportService';
import { getStatusHistory } from '@/features/reports/services/reportRepository';
import { STORAGE_KEYS } from '@/lib/constants';
import { readJson } from '@/storage/jsonStore';
import { type CaptureSession, type Report, type ReportDraft } from '@/types/report';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'uuid-1' }));
jest.mock('@/storage/photoStorage', () => ({
  photoExists: () => true,
  deleteStoredPhoto: jest.fn(),
  storeCapturedPhoto: jest.fn(),
}));
jest.mock('@/services/supabase/client', () => ({
  isRemoteConfigured: false,
  getSupabase: () => null,
  MEDIA_BUCKET: 'report-media',
}));

/**
 * In-memory stand-in for the device store. `__failWith` makes every write throw so
 * the retry loop can be exercised without touching the network.
 */
jest.mock('@/storage/jsonStore', () => {
  const rows = new Map<string, string>();
  const store = {
    __rows: rows,
    __failWith: null as string | null,
    readJson: async <T,>(key: string, fallback: T): Promise<T> => {
      const raw = rows.get(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    },
    writeJson: async (key: string, value: unknown): Promise<void> => {
      if (store.__failWith) throw new Error(store.__failWith);
      rows.set(key, JSON.stringify(value));
    },
    removeKey: async (key: string): Promise<void> => {
      rows.delete(key);
    },
  };
  return store;
});

const deviceStore = jest.requireMock('@/storage/jsonStore') as {
  __rows: Map<string, string>;
  __failWith: string | null;
};

const CAPTURED_AT = new Date(Date.now() - 60_000).toISOString();

function session(overrides: Partial<CaptureSession> = {}, metadata: Partial<CaptureSession['metadata']> = {}): CaptureSession {
  return {
    id: 'cap_1a2b3c',
    photoUri: 'file:///lapora-evidence/1.jpg',
    photoWidth: 1080,
    photoHeight: 1440,
    photoBytes: 13_000,
    confirmed: true,
    createdAt: CAPTURED_AT,
    metadata: {
      point: { latitude: -7.7956, longitude: 110.3695 },
      accuracyM: 6,
      locationMeasuredAt: CAPTURED_AT,
      capturedAt: CAPTURED_AT,
      source: 'gps',
      ...metadata,
    },
    ...overrides,
  };
}

function input(overrides: Partial<SubmitInput> = {}): SubmitInput {
  return {
    profile: {
      id: 'user-1',
      name: 'Rani',
      email: 'rani@example.com',
      phone: '081234567890',
      isPublic: true,
      notifyOnStatus: true,
    },
    session: session(),
    categoryId: 'pothole',
    description: 'Lubang cukup dalam di tengah jalan, membahayakan pengendara malam.',
    hazardLevel: 'high',
    isPublic: true,
    notifyOnStatus: true,
    address: 'Jl. Malioboro',
    ...overrides,
  };
}

beforeEach(() => {
  deviceStore.__rows.clear();
  deviceStore.__failWith = null;
});

describe('submitReport — local persistence path', () => {
  it('only reports the report as submitted after the row is written and read back', async () => {
    const result = await submitReport(input());

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected success');

    const stored = await readJson<Report[]>(STORAGE_KEYS.reports, []);
    expect(stored.filter((row) => row.id === result.report.id)).toEqual([
      expect.objectContaining({
        status: 'submitted',
        locationConfirmed: true,
        point: { latitude: -7.7956, longitude: 110.3695 },
        accuracyM: 6,
        locationMeasuredAt: CAPTURED_AT,
        capturedAt: CAPTURED_AT,
        description: 'Lubang cukup dalam di tengah jalan, membahayakan pengendara malam.',
      }),
    ]);

    const history = await getStatusHistory(result.report.id);
    expect(history.map((entry) => entry.status)).toEqual(['submitted']);
  });

  it('reports upload progress ending at 100 percent', async () => {
    const progress: number[] = [];
    await submitReport(input(), (step) => progress.push(step.percent));

    expect(progress.at(-1)).toBe(100);
    expect(progress.every((value, index) => index === 0 || value >= progress[index - 1])).toBe(true);
  });

  it('refuses a photo that was not captured inside the app (FR-05/FR-13)', async () => {
    const result = await submitReport(input({ session: session({ id: 'img-from-gallery' }) }));

    expect(result).toEqual({ ok: false, error: expect.objectContaining({ code: 'gate', attempts: 0 }) });
    expect(deviceStore.__rows.has(STORAGE_KEYS.reports)).toBe(false);
  });

  it('refuses an unconfirmed or too-coarse location (FR-11/FR-14)', async () => {
    const unconfirmed = await submitReport(input({ session: session({ confirmed: false }) }));
    const coarse = await submitReport(input({ session: session({}, { accuracyM: 80 }) }));

    if (unconfirmed.ok || coarse.ok) throw new Error('gate must reject');
    expect(unconfirmed.error.code).toBe('gate');
    expect(coarse.error.code).toBe('gate');
    expect(deviceStore.__rows.has(STORAGE_KEYS.reports)).toBe(false);
  });

  it('classifies repeated network failures as offline instead of pretending success', async () => {
    jest.useFakeTimers();
    deviceStore.__failWith = 'Network request failed';
    try {
      const pending = submitReport(input());
      await jest.advanceTimersByTimeAsync(10_000);
      const result = await pending;

      expect(result).toEqual({
        ok: false,
        error: expect.objectContaining({ code: 'offline', message: expect.stringContaining('draf'), attempts: 3 }),
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('classifies a rejected write as an upload failure', async () => {
    jest.useFakeTimers();
    deviceStore.__failWith = 'Penyimpanan laporan tidak terkonfirmasi.';
    try {
      const pending = submitReport(input());
      await jest.advanceTimersByTimeAsync(10_000);
      const result = await pending;

      expect(result).toEqual({ ok: false, error: expect.objectContaining({ code: 'upload', attempts: 3 }) });
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('draft storage', () => {
  const draft: ReportDraft = {
    session: session(),
    categoryId: 'pothole',
    description: 'Lubang cukup dalam di tengah jalan, membahayakan pengendara malam.',
    hazardLevel: 'high',
    isPublic: true,
    notifyOnStatus: true,
    address: 'Jl. Malioboro',
    savedAt: '2026-11-22T12:01:00.000Z',
  };

  it('round-trips a draft and can drop the record while keeping the photo', async () => {
    await saveDraft(draft);
    expect(await readDraft()).toMatchObject({ session: draft.session, categoryId: 'pothole' });

    await dismissDraft();
    expect(await readDraft()).toBeNull();
  });

  it('removes the draft record on clear', async () => {
    await saveDraft(draft);
    await clearDraft();
    expect(await readDraft()).toBeNull();
  });
});
