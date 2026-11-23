import { useCallback, useEffect, useState } from 'react';

import { listHazardZones } from '@/features/hazards/services/hazardService';
import { type GeoPoint, type Report, type ReportDraft } from '@/types/report';
import { useAuthStore } from '@/stores/authStore';
import { haversineMeters } from '@/utils/geo';

import { listReportsForAuthor } from '../services/reportRepository';
import { readDraft } from '../services/reportService';

export type HomeData = {
  loading: boolean;
  mine: Report[];
  nearby: { report: Report; distanceM: number }[];
  verifiedCount: number;
  hazardCount: number;
  draft: ReportDraft | null;
  error: string | null;
};

const EMPTY: HomeData = {
  loading: true,
  mine: [],
  nearby: [],
  verifiedCount: 0,
  hazardCount: 0,
  draft: null,
  error: null,
};

export function useHomeData(anchor: GeoPoint | null, refreshKey = 0): HomeData & { reload: () => void } {
  const profile = useAuthStore((state) => state.profile);
  const [state, setState] = useState<HomeData>(EMPTY);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [reports, zones, draft] = await Promise.all([
          listReportsForAuthor(profile?.id ?? 'guest'),
          listHazardZones(),
          readDraft(),
        ]);
        if (cancelled) return;
        const verified = reports.filter((report) =>
          ['under_review', 'in_progress', 'resolved'].includes(report.status),
        );
        const origin = anchor ?? { latitude: -7.7956, longitude: 110.3695 };
        const nearby = [...reports]
          .filter((report) => report.status !== 'draft')
          .map((report) => ({ report, distanceM: haversineMeters(origin, report.point) }))
          .sort((a, b) => a.distanceM - b.distanceM)
          .slice(0, 3);
        setState({
          loading: false,
          mine: reports,
          nearby,
          verifiedCount: verified.length,
          hazardCount: zones.length,
          draft,
          error: null,
        });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: 'Data laporan gagal dimuat.' }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, anchor, refreshKey, tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  return { ...state, reload };
}
