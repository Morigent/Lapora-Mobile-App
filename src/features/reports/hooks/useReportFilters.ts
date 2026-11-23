import { useEffect, useRef, useState } from 'react';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  from,
  map,
  merge,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  type SchedulerLike,
  asyncScheduler,
} from 'rxjs';

import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { type GeoPoint, type Report, type ReportFilter } from '@/types/report';

import { searchReports } from '../services/reportService';

export type FilterState = {
  reports: Report[];
  loading: boolean;
  error: string | null;
};

function sameFilter(a: ReportFilter, b: ReportFilter): boolean {
  return (
    a.query === b.query &&
    a.area === b.area &&
    a.radiusKm === b.radiusKm &&
    a.windowDays === b.windowDays &&
    a.categories.join('|') === b.categories.join('|') &&
    a.statuses.join('|') === b.statuses.join('|')
  );
}

export type FilterStreamOptions = {
  filter$: BehaviorSubject<ReportFilter>;
  refresh$: Observable<void>;
  getAnchor: () => GeoPoint | null;
  /** Author identity for privacy filtering, read through a getter so a login change re-queries. */
  getViewerId?: () => string | null;
  search?: (filter: ReportFilter, anchor: GeoPoint | null, viewerId: string | null) => Promise<Report[]>;
  scheduler?: SchedulerLike;
};

type Query = { filter: ReportFilter; viewerId: string | null; nonce: number };

function sameQuery(a: Query, b: Query): boolean {
  return a.nonce === b.nonce && a.viewerId === b.viewerId && sameFilter(a.filter, b.filter);
}

/**
 * FR-22 / §3.9: debounceTime → distinctUntilChanged → switchMap. Kept out of the
 * hook so the search contract can be tested without mounting a screen.
 */
export function createFilterStream({
  filter$,
  refresh$,
  getAnchor,
  getViewerId = () => null,
  search = searchReports,
  scheduler = asyncScheduler,
}: FilterStreamOptions): Observable<FilterState> {
  let refreshNonce = 0;

  return merge(
    filter$.pipe(map((filter) => ({ filter, viewerId: getViewerId(), nonce: 0 }) satisfies Query)),
    refresh$.pipe(
      map(() => ({ filter: filter$.getValue(), viewerId: getViewerId(), nonce: ++refreshNonce }) satisfies Query),
    ),
  ).pipe(
    debounceTime(SEARCH_DEBOUNCE_MS, scheduler),
    distinctUntilChanged(sameQuery),
    switchMap(({ filter, viewerId }) =>
      from(search(filter, getAnchor(), viewerId)).pipe(
        map((reports) => ({ reports, loading: false, error: null }) satisfies FilterState),
        startWith({ reports: [], loading: true, error: null } satisfies FilterState),
        catchError(() =>
          of({ reports: [], loading: false, error: 'Laporan gagal dimuat dari perangkat.' } satisfies FilterState),
        ),
      ),
    ),
  );
}

/**
 * Debounced, de-duplicated report search. Screens never call searchReports
 * while the user is typing, and the subscription is torn down on unmount.
 */
export function useReportFilters(filter: ReportFilter, anchor: GeoPoint | null) {
  const viewerId = useAuthStore((state) => state.profile?.id ?? null);
  const [filter$] = useState(() => new BehaviorSubject(filter));
  const [refresh$] = useState(() => new Subject<void>());
  const anchorRef = useRef(anchor);
  const anchorKey = anchor ? `${anchor.latitude},${anchor.longitude}` : '';
  const [state, setState] = useState<FilterState>({ reports: [], loading: true, error: null });

  // The subscription reads the anchor through a ref so a new object identity
  // with the same coordinates never tears down the stream.
  useEffect(() => {
    anchorRef.current = anchor;
  }, [anchor]);

  useEffect(() => {
    filter$.next(filter);
  }, [filter, filter$]);

  // A different account must not inherit another viewer's results, so the
  // subscriber is rebuilt when the viewer changes.
  useEffect(() => {
    const subscription = createFilterStream({
      filter$,
      refresh$,
      getAnchor: () => anchorRef.current,
      getViewerId: () => viewerId,
    }).subscribe(setState);
    return () => subscription.unsubscribe();
  }, [filter$, refresh$, anchorKey, viewerId]);

  return { ...state, refresh: () => refresh$.next() };
}
