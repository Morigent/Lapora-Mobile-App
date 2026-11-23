import { BehaviorSubject, Subject } from 'rxjs';

import { createFilterStream, type FilterState } from '@/features/reports/hooks/useReportFilters';
import { type Report, type ReportFilter } from '@/types/report';

const BASE: ReportFilter = {
  query: '',
  categories: [],
  statuses: [],
  windowDays: null,
  area: 'city',
  radiusKm: 2,
};

const REPORT: Report = {
  id: 'report-1',
  code: 'LP-2611-3407',
  authorId: 'user-1',
  authorName: 'Rani',
  categoryId: 'pothole',
  title: 'Lubang jalan',
  description: 'Lubang cukup dalam di tengah jalan, membahayakan pengendara malam.',
  hazardLevel: 'high',
  status: 'submitted',
  point: { latitude: -7.7956, longitude: 110.3695 },
  accuracyM: 6,
  locationMeasuredAt: '2026-11-22T12:00:00.000Z',
  capturedAt: '2026-11-22T12:00:00.000Z',
  locationConfirmed: true,
  address: 'Jl. Malioboro',
  photoPath: 'file:///1.jpg',
  isPublic: true,
  notifyOnStatus: true,
  createdAt: '2026-11-22T12:02:00.000Z',
  updatedAt: '2026-11-22T12:02:00.000Z',
};

function withQuery(query: string): ReportFilter {
  return { ...BASE, query };
}

function start(search: jest.Mock, viewerId: string | null = null) {
  const filter$ = new BehaviorSubject<ReportFilter>(BASE);
  const refresh$ = new Subject<void>();
  const states: FilterState[] = [];
  const subscription = createFilterStream({
    filter$,
    refresh$,
    getAnchor: () => null,
    getViewerId: () => viewerId,
    search,
  }).subscribe((state) => states.push(state));
  return { filter$, refresh$, states, subscription };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('report filter stream (FR-22)', () => {
  it('collapses a burst of typing into one search for the final query', async () => {
    const search = jest.fn().mockResolvedValue([REPORT]);
    const { filter$, subscription } = start(search);

    filter$.next(withQuery('lub'));
    jest.advanceTimersByTime(100);
    filter$.next(withQuery('luba'));
    jest.advanceTimersByTime(100);
    filter$.next(withQuery('lubang'));
    await jest.advanceTimersByTimeAsync(400);

    expect(search).toHaveBeenCalledTimes(1);
    expect(search.mock.calls[0][0]).toMatchObject({ query: 'lubang' });
    subscription.unsubscribe();
  });

  it('does not re-search an identical filter', async () => {
    const search = jest.fn().mockResolvedValue([REPORT]);
    const { filter$, subscription } = start(search);

    await jest.advanceTimersByTimeAsync(400);
    filter$.next(withQuery(''));
    await jest.advanceTimersByTimeAsync(400);

    expect(search).toHaveBeenCalledTimes(1);
    subscription.unsubscribe();
  });

  it('re-searches when the filter changes after the debounce window', async () => {
    const search = jest.fn().mockResolvedValue([REPORT]);
    const { filter$, states, subscription } = start(search);

    await jest.advanceTimersByTimeAsync(400);
    filter$.next(withQuery('banjir'));
    await jest.advanceTimersByTimeAsync(400);

    expect(search).toHaveBeenCalledTimes(2);
    expect(states.at(-1)).toEqual({ reports: [REPORT], loading: false, error: null });
    subscription.unsubscribe();
  });

  it('re-searches on refresh even when the filter is unchanged', async () => {
    const search = jest.fn().mockResolvedValue([REPORT]);
    const { refresh$, subscription } = start(search);

    await jest.advanceTimersByTimeAsync(400);
    refresh$.next();
    await jest.advanceTimersByTimeAsync(400);

    expect(search).toHaveBeenCalledTimes(2);
    subscription.unsubscribe();
  });

  it('surfaces a storage failure instead of stale results', async () => {
    const search = jest.fn().mockRejectedValue(new Error('storage down'));
    const { states, subscription } = start(search);

    await jest.advanceTimersByTimeAsync(400);

    expect(states.at(-1)).toEqual({
      reports: [],
      loading: false,
      error: 'Laporan gagal dimuat dari perangkat.',
    });
    subscription.unsubscribe();
  });

  it('cancels a pending search when the screen unmounts', async () => {
    const search = jest.fn().mockResolvedValue([REPORT]);
    const { filter$, subscription } = start(search);

    filter$.next(withQuery('lubang'));
    subscription.unsubscribe();
    await jest.advanceTimersByTimeAsync(1000);

    expect(search).not.toHaveBeenCalled();
  });
});

describe('viewer identity in the filter stream (NFR-05)', () => {
  it('passes the signed-in account to the search so private rows can be excluded', async () => {
    const search = jest.fn().mockResolvedValue([REPORT]);
    const { subscription } = start(search, 'user-rani');

    await jest.advanceTimersByTimeAsync(400);

    expect(search.mock.calls[0][2]).toBe('user-rani');
    subscription.unsubscribe();
  });

  it('searches anonymously when nobody is signed in', async () => {
    const search = jest.fn().mockResolvedValue([REPORT]);
    const { subscription } = start(search);

    await jest.advanceTimersByTimeAsync(400);

    expect(search.mock.calls[0][2]).toBeNull();
    subscription.unsubscribe();
  });
});
