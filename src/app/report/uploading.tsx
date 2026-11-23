import { useIsFocused, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { HandNote } from '@/components/common/HandNote';
import { Icon } from '@/components/common/Icon';
import { Screen } from '@/components/common/Screen';
import { space } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { isRemoteConfigured } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useCameraStore } from '@/stores/cameraStore';
import { useReportStore } from '@/stores/reportStore';
import { type HazardLevel, type ReportCategoryId } from '@/types/report';
import { formatBytes } from '@/utils/bytes';

/** Design screen 10 — upload only resolves to success after read-back. */
export default function UploadingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const focused = useIsFocused();
  const params = useLocalSearchParams<{
    categoryId: ReportCategoryId;
    description: string;
    hazardLevel: HazardLevel;
    isPublic: string;
    notifyOnStatus: string;
    address: string;
    title: string;
  }>();
  const profile = useAuthStore((state) => state.profile);
  const session = useCameraStore((state) => state.session);
  const submit = useReportStore((state) => state.submit);
  const progress = useReportStore((state) => state.progress);
  const [minimized, setMinimized] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (!profile || !session) {
      if (focused) router.replace('/(tabs)/home');
      return;
    }
    started.current = true;
    (async () => {
      const result = await submit({
        profile,
        session,
        categoryId: params.categoryId,
        description: params.description,
        hazardLevel: params.hazardLevel,
        isPublic: params.isPublic !== 'false',
        notifyOnStatus: params.notifyOnStatus === 'true',
        address: params.address ? params.address : null,
      });
      if (result.ok) router.replace('/report/success');
      else router.replace('/report/failed');
    })();
  }, [profile, session, params, submit, router, focused]);

  const bytes = session?.photoBytes ?? 0;
  const steps = [
    { key: 'photo', label: 'Foto & metadata', doneAt: 12 },
    { key: 'location', label: 'Lokasi terkonfirmasi', doneAt: 28 },
    { key: 'upload', label: isRemoteConfigured ? 'Unggah ke server' : 'Simpan di perangkat', doneAt: 100 },
  ];

  return (
    <Screen scroll={false} bottomInset contentStyle={styles.content}>
      <View style={styles.body}>
        <View style={styles.head}>
          <AppText variant="label" color="ink3">
            {isRemoteConfigured ? 'MENGIRIM' : 'MENYIMPAN'}
          </AppText>
          <AppText variant="h1">{isRemoteConfigured ? 'Mengirim laporan' : 'Menyimpan laporan'}</AppText>
          <AppText variant="body" color="ink2">
            {isRemoteConfigured
              ? 'Jangan tutup aplikasi. Foto dan metadata sedang diunggah.'
              : 'Jangan tutup aplikasi. Laporan sedang disimpan lalu dibaca ulang dari perangkat.'}
          </AppText>
        </View>

        <AppCard padding={18} background={colors.paper2} shadow={false}>
          <View style={styles.progressRow}>
            <AppText variant="display" color="accent">
              {progress.percent}%
            </AppText>
            <AppText variant="meta" color="ink3" style={styles.sizeText}>
              {bytes ? `${formatBytes(bytes)} · ` : ''}
              {progress.message}
            </AppText>
          </View>
          <View style={[styles.track, { backgroundColor: colors.paper3 }]}>
            <View style={[styles.fill, { width: `${Math.max(4, progress.percent)}%`, backgroundColor: colors.accent }]} />
          </View>

          <View style={styles.steps}>
            {steps.map((step) => {
              const done = progress.percent >= step.doneAt;
              return (
                <View key={step.key} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepIcon,
                      {
                        borderColor: done ? colors.ink : colors.paper3,
                        backgroundColor: done ? colors.ink : colors.paper,
                      },
                    ]}
                  >
                    <Icon name={done ? 'check' : 'dots'} size={11} color={done ? colors.paper : colors.ink3} />
                  </View>
                  <AppText variant="bodySmall" color={done ? 'ink' : 'ink3'} style={styles.stepText}>
                    {step.label}
                  </AppText>
                  {done ? (
                    <AppText variant="meta" color="ink3">
                      OK
                    </AppText>
                  ) : null}
                </View>
              );
            })}
          </View>
        </AppCard>

        {minimized ? (
          <View style={styles.minRow}>
            <Icon name="upload" size={14} color={colors.ink3} />
            <AppText variant="bodySmall" color="ink3">
              Unggahan tetap berjalan di layar ini.
            </AppText>
          </View>
        ) : (
          <HandNote size={16} color={colors.ink3} align="center">
            status baru jadi terkirim setelah penyimpanan terbaca ulang
          </HandNote>
        )}
      </View>

      <View style={styles.footer}>
        <AppButton
          label={minimized ? 'Tampilkan progres' : 'Sembunyikan'}
          variant="outline"
          size="small"
          onPress={() => setMinimized(!minimized)}
        />
        <AppText variant="meta" color="ink3" align="center">
          Unggahan berjalan di layar ini.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'space-between', paddingTop: space.xl },
  body: { gap: space.xl },
  head: { gap: space.sm },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, marginBottom: space.md },
  sizeText: { flex: 1 },
  track: { height: 12, borderRadius: 6, overflow: 'hidden' },
  fill: { height: 12, borderRadius: 6 },
  steps: { gap: space.sm, marginTop: space.lg },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1 },
  minRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  footer: { gap: space.sm },
});
