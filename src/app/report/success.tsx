import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { HandNote } from '@/components/common/HandNote';
import { Icon } from '@/components/common/Icon';
import { Screen } from '@/components/common/Screen';
import { StatusBadge } from '@/components/common/StatusBadge';
import { border, radius, space } from '@/constants/design';
import { CATEGORY_LABEL } from '@/constants/reportMeta';
import { useTheme } from '@/hooks/use-theme';
import { isRemoteConfigured } from '@/services/supabase/client';
import { useCameraStore } from '@/stores/cameraStore';
import { useReportStore } from '@/stores/reportStore';
import { formatRelative, formatShortStamp } from '@/utils/date';

/** Design screen 11. */
export default function SuccessScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const report = useReportStore((state) => state.report);
  const resetReport = useReportStore((state) => state.reset);
  const resetCamera = useCameraStore((state) => state.reset);

  const goHome = () => {
    resetReport();
    resetCamera();
    router.replace('/(tabs)/home');
  };

  if (!report) {
    return (
      <Screen scroll={false} contentStyle={styles.content}>
        <AppText variant="h2">Laporan belum tercatat</AppText>
        <AppButton label="Kembali ke beranda" onPress={goHome} />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.body}>
        <View style={[styles.mark, { borderColor: colors.ink, backgroundColor: colors.paper }]}>
          <Icon name="check" size={38} color={colors.accent} />
        </View>

        <View style={styles.heading}>
          <AppText variant="display">{isRemoteConfigured ? 'Laporan terkirim' : 'Laporan tercatat'}</AppText>
          <AppText variant="body" color="ink2" align="center">
            {isRemoteConfigured
              ? 'Tim lapangan akan memverifikasi laporanmu. Kamu bisa memantau statusnya di Riwayat Laporan.'
              : 'Laporan tersimpan di perangkat ini. Statusnya belum berubah sampai backend tersambung.'}
          </AppText>
        </View>

        <AppCard padding={16}>
          <AppText variant="label" color="ink3">
            ID LAPORAN
          </AppText>
          <AppText variant="h2" style={styles.code}>
            {report.code}
          </AppText>
          <View style={[styles.divider, { backgroundColor: colors.paper3 }]} />
          <InfoRow label="Kategori" value={CATEGORY_LABEL[report.categoryId] ?? '—'} />
          <InfoRow label="Waktu" value={formatShortStamp(report.capturedAt)} />
          <View style={styles.infoRow}>
            <AppText variant="bodySmall" color="ink3">
              Status
            </AppText>
            <StatusBadge status={report.status} compact />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.paper3 }]} />
          <AppText variant="meta" color="ink3">
            {isRemoteConfigured
              ? 'TERSIMPAN DI PERANGKAT & SERVER'
              : 'TERSIMPAN DI PERANGKAT · BACKEND BELUM TERSAMBUNG'}
          </AppText>
        </AppCard>

        <HandNote size={17} color={colors.ink3} align="center">
          satu laporan, satu titik — terima kasih
        </HandNote>
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Lihat detail laporan"
          iconRight="arrow"
          onPress={() => {
            resetCamera();
            router.replace({ pathname: '/report/[id]', params: { id: report.id } });
          }}
        />
        <AppButton label="Kembali ke beranda" variant="outline" onPress={goHome} />
        <AppText variant="meta" color="ink3" align="center">
          {isRemoteConfigured
            ? `Dikirim ${formatRelative(report.createdAt)}`
            : `Dicatat ${formatRelative(report.createdAt)}`}
        </AppText>
      </View>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText variant="bodySmall" color="ink3">
        {label}
      </AppText>
      <AppText variant="bodySmall" weight="600">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'space-between', paddingTop: space.xxl, gap: space.xl },
  body: { alignItems: 'center', gap: space.lg },
  mark: {
    width: 86,
    height: 86,
    borderRadius: radius.card,
    borderWidth: border.heavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { alignItems: 'center', gap: space.sm },
  code: { marginTop: 2 },
  divider: { height: 1, marginVertical: space.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 },
  footer: { gap: space.sm },
});
