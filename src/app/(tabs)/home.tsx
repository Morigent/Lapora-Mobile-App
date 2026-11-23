import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/common/AppBar';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppChip } from '@/components/common/AppChip';
import { AppText } from '@/components/common/AppText';
import { EmptyState, LoadingState } from '@/components/common/Feedback';
import { HandNote } from '@/components/common/HandNote';
import { Icon } from '@/components/common/Icon';
import { IconButton } from '@/components/common/IconButton';
import { PressableScale } from '@/components/common/PressableScale';
import { Screen } from '@/components/common/Screen';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ReportThumb } from '@/components/report/ReportThumb';
import { border, radius, space } from '@/constants/design';
import { REPORT_CATEGORIES } from '@/constants/reportMeta';
import { useLocationTracking } from '@/features/location/hooks/useLocationTracking';
import { useHomeData } from '@/features/reports/hooks/useHomeData';
import { useTheme } from '@/hooks/use-theme';
import { DEFAULT_MAP_RADIUS_KM } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { formatRelative } from '@/utils/date';
import { formatDistance } from '@/utils/geo';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const { point, request } = useLocationTracking();
  const home = useHomeData(point);

  const firstName = profile?.name.split(' ')[0] ?? 'Warga';
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'SELAMAT PAGI,' : hour < 15 ? 'SELAMAT SIANG,' : hour < 19 ? 'SELAMAT SORE,' : 'SELAMAT MALAM,';

  if (home.loading) {
    return (
      <Screen topInset={false} contentStyle={styles.content}>
        <AppBar
          title="Beranda"
          right={<IconButton icon="bell" label="Notifikasi" onPress={() => router.push('/(tabs)/profile')} />}
        />
        <LoadingState label="Menyinkronkan laporan terdekat…" />
        <HandNote size={15} color={colors.ink3}>
          kerangka menjaga layout tetap, bukan layar kosong
        </HandNote>
      </Screen>
    );
  }

  const isEmpty = home.nearby.length === 0;

  return (
    <Screen topInset contentStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <AppText variant="label" color="ink3">
            {greeting}
          </AppText>
          <AppText variant="h1" numberOfLines={1}>
            {firstName}
          </AppText>
        </View>
        <IconButton icon="bell" label="Notifikasi" onPress={() => router.push('/(tabs)/profile')} />
      </View>

      {home.draft ? (
        <AppCard
          background={colors.paper2}
          padding={14}
          onPress={() => router.push('/report/failed')}
          accessibilityLabel="Draf tersimpan"
        >
          <View style={styles.draftRow}>
            <Icon name="upload" size={18} color={colors.ink} />
            <View style={styles.draftText}>
              <AppText variant="bodySmall" weight="600">
                Draf menunggu dikirim
              </AppText>
              <AppText variant="meta" color="ink3">
                TERSIMPAN DI PERANGKAT · KETUK UNTUK MELIHAT
              </AppText>
            </View>
            <Icon name="chev" size={18} color={colors.ink3} />
          </View>
        </AppCard>
      ) : null}

      <AppCard
        background={colors.ink}
        borderColor={colors.ink}
        padding={18}
        onPress={() => router.push('/report/camera')}
        accessibilityLabel="Buat laporan baru"
      >
        <View style={styles.ctaRow}>
          <View style={styles.ctaText}>
            <AppText variant="label" color="paper2">
              MULAI DALAM 30 DETIK
            </AppText>
            <AppText variant="display" color="paper" style={styles.ctaTitle}>
              Buat{'\n'}Laporan
            </AppText>
            <View style={[styles.ctaChip, { borderColor: colors.ink3 }]}>
              <Icon name="camera" size={13} color={colors.paper2} />
              <AppText variant="meta" color="paper2">
                Kamera dalam aplikasi
              </AppText>
            </View>
          </View>
          <View style={[styles.ctaCircle, { backgroundColor: colors.accent }]}>
            <Icon name="arrow" size={26} color={colors.paper} />
          </View>
        </View>
      </AppCard>

      <View style={styles.statsRow}>
        <Stat value={String(home.mine.length)} label="Laporan saya" />
        <Stat value={String(home.verifiedCount)} label="Terverifikasi" />
        <Stat value={String(home.hazardCount)} label="Area rawan" accent />
      </View>

      {isEmpty ? (
        <EmptyState
          icon="map"
          title={'Belum ada laporan\ndi sekitarmu'}
          body="Peta hanya menampilkan laporan yang tersedia pada sistem — bukan seluruh kerusakan kota."
          primaryLabel="Buat laporan pertama"
          onPrimary={() => router.push('/report/camera')}
          secondaryLabel="Muat ulang"
          onSecondary={home.reload}
          footnote={`Radius awal ${formatDistance(DEFAULT_MAP_RADIUS_KM * 1000)} · bisa diubah di filter`}
        >
          <View style={styles.chipWrap}>
            {REPORT_CATEGORIES.slice(0, 4).map((category) => (
              <AppChip key={category.id} label={category.label} size="small" />
            ))}
          </View>
        </EmptyState>
      ) : (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <AppText variant="h3">Laporan terdekat</AppText>
            <PressableScale accessibilityRole="button" onPress={() => router.push('/(tabs)/map')}>
              <AppText variant="meta" color="ink2" style={styles.sectionLink}>
                PETA →
              </AppText>
            </PressableScale>
          </View>

          {home.nearby.map(({ report, distanceM }) => (
            <PressableScale
              key={report.id}
              accessibilityRole="button"
              accessibilityLabel={report.title}
              onPress={() => router.push({ pathname: '/report/[id]', params: { id: report.id } })}
            >
              <View style={[styles.row, { borderColor: colors.paper3 }]}>
                <ReportThumb report={report} size={56} />
                <View style={styles.rowBody}>
                  <AppText variant="bodySmall" weight="600" numberOfLines={1}>
                    {report.title}
                  </AppText>
                  <AppText variant="bodySmall" color="ink3" numberOfLines={1}>
                    {[report.address ?? 'Tanpa nama jalan', formatDistance(distanceM), formatRelative(report.capturedAt)].join(' · ')}
                  </AppText>
                </View>
                <StatusBadge status={report.status} compact />
              </View>
            </PressableScale>
          ))}
        </View>
      )}

      <AppCard background={colors.paper2} padding={14} shadow={false}>
        <View style={styles.hazardRow}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Area rawan bencana"
            onPress={() => router.push('/(tabs)/map')}
            style={styles.hazardBody}
          >
            <View style={styles.hazardIcon}>
              <Icon name="alert" size={18} color={colors.accent} />
            </View>
            <View style={styles.hazardText}>
              <AppText variant="bodySmall" weight="600">
                Area rawan bencana
              </AppText>
              <AppText variant="meta" color="ink3">
                Bukan peringatan resmi · {home.hazardCount} lokasi
              </AppText>
            </View>
          </PressableScale>
          <PressableScale accessibilityRole="button" accessibilityLabel="Perbarui lokasi" onPress={request}>
            <Icon name="refresh" size={18} color={colors.ink3} />
          </PressableScale>
        </View>
      </AppCard>

      <AppButton
        label="Laporkan kerusakan baru"
        variant="outline"
        icon="camera"
        onPress={() => router.push('/report/camera')}
      />
    </Screen>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stat, { borderColor: colors.paper3 }]}>
      <AppText variant="number" color={accent ? 'accent' : 'ink'}>
        {value}
      </AppText>
      <AppText variant="meta" color="ink3" style={styles.statLabel}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.lg, paddingTop: space.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerText: { flex: 1, gap: 2 },
  draftRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  draftText: { flex: 1, gap: 2 },
  ctaRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  ctaText: { gap: space.sm, flex: 1 },
  ctaTitle: { fontSize: 38, lineHeight: 40 },
  ctaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.2,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  ctaCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: space.sm },
  stat: { flex: 1, borderWidth: 1.4, borderRadius: radius.tile, padding: space.md, gap: 2 },
  statLabel: { fontSize: 10 },
  section: { gap: space.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLink: { letterSpacing: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: border.hair,
  },
  rowBody: { flex: 1, gap: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center', marginVertical: 4 },
  hazardRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  hazardBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md },
  hazardIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  hazardText: { flex: 1, gap: 2 },
});
