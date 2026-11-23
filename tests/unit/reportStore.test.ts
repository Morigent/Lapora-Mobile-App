import {
  clearDraft,
  dismissDraft,
  readDraft,
  saveDraft,
  submitReport,
  type SubmitInput,
} from '@/features/reports/services/reportService';
import { useReportStore } from '@/stores/reportStore';
import { type Report, type ReportDraft } from '@/types/report';

jest.mock('@/features/reports/services/reportService', () => ({
  submitReport: jest.fn(),
  saveDraft: jest.fn(),
  readDraft: jest.fn(),
  clearDraft: jest.fn(),
  dismissDraft: jest.fn(),
}));

const mockedSubmit = submitReport as jest.MockedFunction<typeof submitReport>;
const mockedSaveDraft = saveDraft as jest.MockedFunction<typeof saveDraft>;
const mockedReadDraft = readDraft as jest.MockedFunction<typeof readDraft>;
const mockedClearDraft = clearDraft as jest.MockedFunction<typeof clearDraft>;
const mockedDismissDraft = dismissDraft as jest.MockedFunction<typeof dismissDraft>;

const INPUT: SubmitInput = {
  profile: {
    id: 'user-1',
    name: 'Rani',
    email: 'rani@example.com',
    phone: '081234567890',
    isPublic: true,
    notifyOnStatus: true,
  },
  session: {
    id: 'cap_1a2b3c',
    photoUri: 'file:///lapora-evidence/1.jpg',
    photoWidth: 1080,
    photoHeight: 1440,
    photoBytes: 13_000,
    confirmed: true,
    createdAt: '2026-11-22T12:00:00.000Z',
    metadata: {
      point: { latitude: -7.7956, longitude: 110.3695 },
      accuracyM: 6,
      locationMeasuredAt: '2026-11-22T12:00:00.000Z',
      capturedAt: '2026-11-22T12:00:00.000Z',
      source: 'gps',
    },
  },
  categoryId: 'pothole',
  description: 'Lubang cukup dalam di tengah jalan, membahayakan pengendara malam.',
  hazardLevel: 'high',
  isPublic: true,
  notifyOnStatus: true,
  address: 'Jl. Malioboro',
};

const DRAFT: ReportDraft = {
  session: INPUT.session,
  categoryId: 'pothole',
  description: INPUT.description,
  hazardLevel: 'high',
  isPublic: true,
  notifyOnStatus: true,
  address: 'Jl. Malioboro',
  savedAt: '2026-11-22T12:01:00.000Z',
};

const REPORT: Report = {
  id: 'report-1',
  code: 'LP-2611-3407',
  authorId: 'user-1',
  authorName: 'Rani',
  categoryId: 'pothole',
  title: 'Lubang jalan',
  description: INPUT.description,
  hazardLevel: 'high',
  status: 'submitted',
  point: INPUT.session.metadata.point,
  accuracyM: 6,
  locationMeasuredAt: INPUT.session.metadata.locationMeasuredAt,
  capturedAt: INPUT.session.metadata.capturedAt,
  locationConfirmed: true,
  address: 'Jl. Malioboro',
  photoPath: INPUT.session.photoUri,
  isPublic: true,
  notifyOnStatus: true,
  createdAt: '2026-11-22T12:02:00.000Z',
  updatedAt: '2026-11-22T12:02:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  useReportStore.setState({
    phase: 'idle',
    progress: { percent: 0, step: 'photo', message: 'Menyiapkan' },
    error: null,
    attemptedAt: null,
    report: null,
    input: null,
    draft: null,
  });
});

describe('reportStore submission', () => {
  it('reaches success and clears the draft record once the backend confirms', async () => {
    useReportStore.setState({ draft: DRAFT });
    mockedSubmit.mockResolvedValue({ ok: true, report: REPORT });

    const result = await useReportStore.getState().submit(INPUT);

    expect(result.ok).toBe(true);
    expect(mockedDismissDraft).toHaveBeenCalledTimes(1);
    expect(useReportStore.getState()).toMatchObject({
      phase: 'success',
      report: REPORT,
      draft: null,
      error: null,
    });
  });

  it('keeps the draft untouched when submission fails', async () => {
    useReportStore.setState({ draft: DRAFT });
    const error = { code: 'offline' as const, message: 'Tidak ada koneksi.', attempts: 3 };
    mockedSubmit.mockResolvedValue({ ok: false, error });

    await useReportStore.getState().submit(INPUT);

    expect(mockedDismissDraft).not.toHaveBeenCalled();
    expect(useReportStore.getState()).toMatchObject({ phase: 'failed', error, draft: DRAFT, report: null });
  });

  it('stamps the failed attempt with a wall-clock time the screen can show', async () => {
    mockedSubmit.mockResolvedValue({ ok: false, error: { code: 'upload', message: 'Gagal.', attempts: 3 } });

    const before = Date.now();
    await useReportStore.getState().submit(INPUT);
    const { attemptedAt } = useReportStore.getState();

    expect(attemptedAt).toBeGreaterThanOrEqual(before);
    expect(attemptedAt).toBeLessThanOrEqual(Date.now());

    useReportStore.getState().reset();
    expect(useReportStore.getState().attemptedAt).toBeNull();
  });

  it('retries the last input and returns null when nothing was submitted', async () => {
    expect(await useReportStore.getState().retry()).toBeNull();

    mockedSubmit.mockResolvedValue({ ok: true, report: REPORT });
    await useReportStore.getState().submit(INPUT);
    mockedSubmit.mockClear();
    await useReportStore.getState().retry();

    expect(mockedSubmit).toHaveBeenCalledWith(INPUT, expect.any(Function));
  });
});

describe('reportStore draft lifecycle', () => {
  it('saves the current input as a draft and survives a reset', async () => {
    useReportStore.setState({ input: INPUT });

    await useReportStore.getState().saveCurrentAsDraft();

    expect(mockedSaveDraft).toHaveBeenCalledTimes(1);
    expect(mockedSaveDraft.mock.calls[0][0]).toMatchObject({
      session: INPUT.session,
      categoryId: 'pothole',
      description: INPUT.description,
    });
    useReportStore.getState().reset();
    expect(useReportStore.getState().draft).not.toBeNull();
  });

  it('resumes a stored draft into a submit-ready input', async () => {
    mockedReadDraft.mockResolvedValue(DRAFT);

    const resumed = await useReportStore.getState().resumeDraft(INPUT.profile);

    expect(resumed).toBe(true);
    expect(useReportStore.getState().input).toMatchObject({
      session: DRAFT.session,
      description: DRAFT.description,
      address: DRAFT.address,
    });
  });

  it('reports no resumable draft when storage is empty', async () => {
    mockedReadDraft.mockResolvedValue(null);

    expect(await useReportStore.getState().resumeDraft(INPUT.profile)).toBe(false);
    expect(useReportStore.getState().input).toBeNull();
  });

  it('deletes the draft and its evidence photo on discard', async () => {
    useReportStore.setState({ draft: DRAFT });

    await useReportStore.getState().discardDraft();

    expect(mockedClearDraft).toHaveBeenCalledTimes(1);
    expect(useReportStore.getState().draft).toBeNull();
  });
});
