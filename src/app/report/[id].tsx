import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { ErrorState, LoadingState } from '@/components/common/Feedback';
import { Icon } from '@/components/common/Icon';
import { IconButton } from '@/components/common/IconButton';
import { Screen } from '@/components/common/Screen';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ReportEvidence } from '@/components/report/ReportEvidence';
import { StatusTimeline, type StatusEvent } from '@/components/report/StatusTimeline';
import { border, radius, space } from '@/constants/design';
import { CATEGORY_LABEL, HAZARD_META } from '@/constants/reportMeta';
import { useLocationTracking } from '@/features/location/hooks/useLocationTracking';
import { getStatusHistory } from '@/features/reports/services/reportRepository';
import { loadReportDetail } from '@/features/reports/services/reportService';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/authStore';
import { type Report } from '@/types/report';
import { formatCoordinates, formatShortStamp } from '@/utils/date';
import { formatAccuracy, formatDistance, haversineMeters } from '@/utils/geo';

/** Design screen 14. */
export default function ReportDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const viewerId = useAuthStore((state) => state.profile?.id ?? null);
  const { point } = useLocationTracking();
  const [report, setReport] = useState<Report | null>(null);
  const [events, setEvents] = useState<StatusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const found = id ? await loadReportDetail(id, viewerId) : null;
      if (cancelled) return;
      setReport(found);
      if (found) setEvents((await getStatusHistory(found.id)) as StatusEvent[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, viewerId]);

  if (loading) {
    return (
      <Screen contentStyle={styles.content}>
        <LoadingState label="Memuat detail laporan…" />
      </Screen>
    );
  }

  if (!report) {
    return (
      <Screen contentStyle={styles.content}>
        <ErrorState
          title="Laporan tidak ditemukan"
          body="Mungkin laporan ini sudah dihapus dari perangkat."
          primaryLabel="Kembali ke riwayat"
          onPrimary={() => router.replace('/(tabs)/history')}
        />
      </Screen>
    );
  }

  const distanceM = point ? haversineMeters(point, report.point) : null;
  const hazard = HAZARD_META[report.hazardLevel];

  return (
    <Screen bottomInset contentStyle={styles.content}>
      <View style={styles.head}>
        <IconButton icon="back" label="Kembali" onPress={() => router.back()} />
        <AppText variant="h3">Detail laporan</AppText>
        <View style={styles.headSpacer} />
      </View>

      <ReportEvidence report={report} />

      <View style={styles.titleBlock}>
        <View style={styles.badgeRow}>
          <View style={[styles.codeChip, { borderColor: colors.paper3 }]}>
            <AppText variant="meta" color="ink3">
              {report.code}
            </AppText>
          </View>
          <StatusBadge status={report.status} compact showIcon />
        </View>
        <AppText variant="h1">{report.title}</AppText>
        <AppText variant="bodySmall" color="ink3">
          {[report.address ?? 'Lokasi tidak diberi nama', distanceM != null ? `${formatDistance(distanceM)} dari kamu` : null]
            .filter(Boolean)
            .join(' · ')}
        </AppText>
      </View>

      <AppCard padding={16} shadow={false} background={colors.paper2}>
        <MetaRow label="Kategori" value={CATEGORY_LABEL[report.categoryId] ?? report.title} />
        <MetaRow label="Waktu lapor" value={formatShortStamp(report.capturedAt)} />
        <MetaRow label="Koordinat" value={formatCoordinates(report.point.latitude, report.point.longitude)} />
        <MetaRow label="Akurasi" value={formatAccuracy(report.accuracyM)} />
        <MetaRow label="Tingkat bahaya" value={hazard.label} />
      </AppCard>

      <View style={styles.section}>
        <AppText variant="label" color="ink3">
          DESKRIPSI
        </AppText>
        <AppText variant="body" color="ink2">
          {report.description}
        </AppText>
      </View>

      <View style={styles.reporterRow}>
        <View style={[styles.avatar, { borderColor: colors.ink }]}>
          <Icon name="user" size={16} color={colors.ink} />
        </View>
        <AppText variant="bodySmall" color="ink3">
          Dilaporkan oleh {report.authorName.split(' ')[0]} · warga
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="label" color="ink3">
          RIWAYAT STATUS
        </AppText>
        <StatusTimeline events={events} />
      </View>

      <View style={styles.actions}>
        <AppButton label="Lihat di peta" variant="outline" icon="map" onPress={() => router.push('/(tabs)/map')} />
        <AppButton label="Laporkan masalah lain" icon="camera" onPress={() => router.push('/report/camera')} />
      </View>
    </Screen>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <AppText variant="bodySmall" color="ink3">
        {label}
      </AppText>
      <AppText variant="bodySmall" weight="600" style={styles.metaValue} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.lg, paddingTop: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headSpacer: { width: 44 },
  titleBlock: { gap: space.sm },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  codeChip: { borderWidth: 1.2, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md, paddingVertical: 3 },
  metaValue: { flex: 1, textAlign: 'right' },
  section: { gap: space.sm },
  reporterRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: border.hair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { gap: space.sm },
});
