import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppChip } from '@/components/common/AppChip';
import { AppText } from '@/components/common/AppText';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/Feedback';
import { Icon } from '@/components/common/Icon';
import { Screen } from '@/components/common/Screen';
import { ReportListCard } from '@/components/report/ReportListCard';
import { layout, radius, space, type as typeScale } from '@/constants/design';
import { REPORT_CATEGORIES } from '@/constants/reportMeta';
import { useLocationTracking } from '@/features/location/hooks/useLocationTracking';
import { useReportFilters } from '@/features/reports/hooks/useReportFilters';
import { readDraft } from '@/features/reports/services/reportService';
import { useTheme } from '@/hooks/use-theme';
import { isRemoteConfigured } from '@/services/supabase/client';
import { useReportStore } from '@/stores/reportStore';
import { type ReportStatus } from '@/types/report';
import { formatDate } from '@/utils/date';
import { haversineMeters } from '@/utils/geo';

type ChipDef = { label: string; value: ReportStatus[] };

const STATUS_CHIPS: ChipDef[] = [
  { label: 'Semua', value: [] },
  { label: 'Terkirim', value: ['submitted'] },
  { label: 'Diverifikasi', value: ['under_review', 'in_progress'] },
  { label: 'Selesai', value: ['resolved'] },
];

/** Design screen 15. */
export default function HistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { point } = useLocationTracking();
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [draftCount, setDraftCount] = useState(0);

  const filter = useMemo(
    () => ({
      query,
      statuses: statuses as ReportStatus[],
      categories: [],
      windowDays: null,
      area: 'city' as const,
      radiusKm: 50,
    }),
    [query, statuses],
  );

  const { reports, loading, error, refresh } = useReportFilters(filter, point);

  useEffect(() => {
    readDraft().then((draft) => setDraftCount(draft ? 1 : 0));
  }, [reports.length]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof reports>();
    for (const report of reports) {
      const key = formatDate(report.capturedAt);
      map.set(key, [...(map.get(key) ?? []), report]);
    }
    return [...map.entries()];
  }, [reports]);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <AppText variant="h1">Riwayat Laporan</AppText>
        <View style={[styles.search, { backgroundColor: colors.paper2, borderColor: colors.paper3 }]}>
          <Icon name="search" size={16} color={colors.ink3} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari di riwayat"
            placeholderTextColor={colors.ink3}
            style={[typeScale.bodySmall, styles.input, { color: colors.ink }]}
            returnKeyType="search"
          />
          {query ? (
            <AppChip label="Hapus" size="small" tone="soft" onPress={() => setQuery('')} />
          ) : null}
        </View>
        <View style={styles.chips}>
          {STATUS_CHIPS.map((chip) => (
            <AppChip
              key={chip.label}
              label={chip.label}
              size="small"
              selected={statuses.join() === chip.value.join()}
              onPress={() => setStatuses(chip.value)}
            />
          ))}
        </View>
      </View>

      {draftCount > 0 ? (
        <View style={[styles.draftRow, { borderColor: colors.ink }]}>
          <Icon name="upload" size={15} color={colors.ink} />
          <View style={styles.draftText}>
            <AppText variant="bodySmall" weight="600">
              {draftCount} draf tersimpan
            </AppText>
            <AppText variant="meta" color="ink3">
              Belum terkirim · foto & metadata tetap di perangkat
            </AppText>
          </View>
          <AppChip
            label="Lihat"
            size="small"
            onPress={() => {
              useReportStore.getState().loadDraft();
              router.push('/report/failed');
            }}
          />
        </View>
      ) : null}

      {error ? (
        <ErrorState title="Riwayat gagal dimuat" body={error} primaryLabel="Coba lagi" onPrimary={refresh} />
      ) : loading ? (
        <LoadingState label={isRemoteConfigured ? 'Menyinkronkan riwayat laporan…' : 'Memuat riwayat laporan…'} />
      ) : reports.length === 0 ? (
        <EmptyState
          icon="clock"
          title="Belum ada riwayat"
          body="Laporan yang kamu kirim akan muncul di sini beserta statusnya."
          primaryLabel="Buat laporan baru"
          onPrimary={() => router.push('/report/camera')}
          footnote={
            isRemoteConfigured
              ? 'Status berubah setelah tim lapangan memverifikasi.'
              : 'Status belum berubah otomatis — backend belum tersambung.'
          }
        >
          <View style={styles.chips}>
            {REPORT_CATEGORIES.map((category) => (
              <AppChip key={category.id} label={category.label} size="small" tone="soft" />
            ))}
          </View>
        </EmptyState>
      ) : (
        <>
          {groups.map(([day, rows]) => (
            <View key={day} style={styles.group}>
              <AppText variant="label" color="ink3">
                {day.toUpperCase()}
              </AppText>
              {rows.map((report) => (
                <ReportListCard
                  key={report.id}
                  report={report}
                  distanceM={point ? haversineMeters(point, report.point) : null}
                  onPress={() => router.push({ pathname: '/report/[id]', params: { id: report.id } })}
                />
              ))}
            </View>
          ))}
          <AppText variant="meta" color="ink3" align="center">
            {reports.length} laporan · {draftCount} draf tersimpan
          </AppText>
        </>
      )}

      <AppButton label="Laporkan kerusakan baru" icon="camera" onPress={() => router.push('/report/camera')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.md },
  header: { gap: space.sm },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1.4,
    borderRadius: radius.input,
    paddingHorizontal: space.md,
    height: 46,
  },
  input: { flex: 1, paddingVertical: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  draftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1.4,
    borderRadius: radius.input,
    padding: space.md,
  },
  draftText: { flex: 1, gap: 1 },
  group: { gap: space.sm },
  spacer: { height: space.xs, width: layout.margin },
});
