import { loadReportDetail, searchReports } from '@/features/reports/services/reportService';
import { STORAGE_KEYS } from '@/lib/constants';
import { writeJson } from '@/storage/jsonStore';
import { type Report, type ReportFilter } from '@/types/report';

jest.mock('@/services/supabase/client', () => ({
  isRemoteConfigured: false,
  getSupabase: () => null,
  MEDIA_BUCKET: 'report-media',
}));

jest.mock('@/storage/jsonStore', () => {
  const rows = new Map<string, string>();
  return {
    __rows: rows,
    readJson: async <T,>(key: string, fallback: T): Promise<T> => {
      const raw = rows.get(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    },
    writeJson: async (key: string, value: unknown): Promise<void> => {
      rows.set(key, JSON.stringify(value));
    },
    removeKey: async (key: string): Promise<void> => {
      rows.delete(key);
    },
  };
});

const deviceStore = jest.requireMock('@/storage/jsonStore') as { __rows: Map<string, string> };

const FILTER: ReportFilter = {
  query: '',
  categories: [],
  statuses: [],
  windowDays: null,
  area: 'city',
  radiusKm: 50,
};

function report(overrides: Partial<Report>): Report {
  return {
    id: 'rpt-1',
    code: 'LP-2611-0001',
    authorId: 'user-rani',
    authorName: 'Rani',
    categoryId: 'pothole',
    title: 'Jalan berlubang',
    description: 'Lubang lebar di tengah jalan, membahayakan pengendara malam.',
    hazardLevel: 'medium',
    status: 'submitted',
    point: { latitude: -7.7956, longitude: 110.3695 },
    accuracyM: 6,
    locationMeasuredAt: '2026-11-22T12:00:00.000Z',
    capturedAt: '2026-11-22T12:00:00.000Z',
    locationConfirmed: true,
    address: 'Jl. Malioboro',
    photoPath: 'file:///lapora-evidence/1.jpg',
    isPublic: true,
    notifyOnStatus: true,
    createdAt: '2026-11-22T12:00:00.000Z',
    updatedAt: '2026-11-22T12:00:00.000Z',
    ...overrides,
  };
}

const PRIVATE = report({ id: 'rpt-private', isPublic: false });
const PUBLIC = report({ id: 'rpt-public', authorId: 'user-budi', authorName: 'Budi' });

beforeEach(async () => {
  deviceStore.__rows.clear();
  await writeJson(STORAGE_KEYS.reports, [PRIVATE, PUBLIC]);
});

describe('report privacy (NFR-05)', () => {
  it('hides another author’s private report from the list query', async () => {
    const ids = (await searchReports(FILTER, null, 'user-budi')).map((row) => row.id);

    expect(ids).toEqual(['rpt-public']);
  });

  it('shows the author their own private report', async () => {
    const ids = (await searchReports(FILTER, null, 'user-rani')).map((row) => row.id);

    expect(ids).toContain('rpt-private');
  });

  it('refuses a direct detail read of another author’s private report', async () => {
    expect(await loadReportDetail('rpt-private', 'user-budi')).toBeNull();
    expect(await loadReportDetail('rpt-private', 'user-rani')).not.toBeNull();
  });
});
