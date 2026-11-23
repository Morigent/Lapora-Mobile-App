import { useIsFocused, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { HandNote } from '@/components/common/HandNote';
import { Icon } from '@/components/common/Icon';
import { IconButton } from '@/components/common/IconButton';
import { Screen } from '@/components/common/Screen';
import { PhotoEvidence } from '@/components/report/PhotoEvidence';
import { border, radius, space } from '@/constants/design';
import { accuracyTier } from '@/features/camera/services/evidenceGate';
import { useTheme } from '@/hooks/use-theme';
import { discardSession } from '@/features/camera/services/discardSession';
import { ACCURACY_HARD_LIMIT_M } from '@/lib/constants';
import { deleteStoredPhoto } from '@/storage/photoStorage';
import { useCameraStore } from '@/stores/cameraStore';
import { formatTime } from '@/utils/date';
import { formatAccuracy } from '@/utils/geo';

export default function PreviewScreen() {
  const focused = useIsFocused();
  const { colors } = useTheme();
  const router = useRouter();
  const session = useCameraStore((state) => state.session);
  const reset = useCameraStore((state) => state.reset);
  const setStatus = useCameraStore((state) => state.setStatus);

  useEffect(() => {
    if (!session && focused) router.replace('/report/camera');
  }, [session, focused, router]);

  if (!session) return null;

  const tier = accuracyTier(session.metadata.accuracyM);
  const blocked = tier === 'bad';

  const retake = async () => {
    await discardSession({ session, reset, deletePhoto: deleteStoredPhoto });
    router.replace('/report/camera');
  };

  const cancel = async () => {
    await discardSession({
      session,
      reset,
      deletePhoto: deleteStoredPhoto,
      afterReset: () => setStatus('cancelled'),
    });
    router.replace('/(tabs)/home');
  };

  return (
    <Screen bottomInset contentStyle={styles.content}>
      <View style={styles.head}>
        <IconButton icon="close" label="Tutup pratinjau" onPress={cancel} />
        <View style={styles.headText}>
          <AppText variant="h2">Pratinjau laporan</AppText>
          <AppText variant="meta" color="ink3">
            LANGKAH 1 DARI 2 · BUKTI
          </AppText>
        </View>
        <View style={styles.headSpacer} />
      </View>

      <PhotoEvidence session={session} />

      <AppCard padding={14}>
        <View style={styles.locRow}>
          <View style={[styles.locIcon, { borderColor: tier === 'good' ? colors.ink : colors.accent }]}>
            <Icon name="target" size={18} color={tier === 'good' ? colors.ink : colors.accent} />
          </View>
          <View style={styles.locText}>
            <AppText variant="bodySmall" weight="600">
              {tier === 'good' ? 'Lokasi baik' : tier === 'coarse' ? 'Lokasi kasar' : 'Lokasi tidak layak'} ·{' '}
              {formatAccuracy(session.metadata.accuracyM)}
            </AppText>
            <AppText variant="meta" color="ink3">
              Diukur saat foto diambil · {formatTime(session.metadata.locationMeasuredAt)}
            </AppText>
          </View>
          <View style={[styles.accChip, { borderColor: tier === 'good' ? colors.paper3 : colors.accent }]}>
            <AppText variant="meta" color={tier === 'good' ? 'ink3' : 'accent'}>
              {formatAccuracy(session.metadata.accuracyM)}
            </AppText>
          </View>
        </View>
      </AppCard>

      {blocked ? (
        <View style={[styles.notice, { borderColor: colors.accent }]}>
          <Icon name="alert" size={16} color={colors.accent} />
          <AppText variant="bodySmall" color="accent" style={styles.noticeText}>
            Akurasi {formatAccuracy(session.metadata.accuracyM)} melewati ambang tim {ACCURACY_HARD_LIMIT_M} m. Ambil
            ulang dari area terbuka — laporan dengan titik sekasar ini tidak bisa dikirim.
          </AppText>
        </View>
      ) : (
        <View style={styles.lockedRow}>
          <Icon name="lock" size={14} color={colors.ink3} />
          <AppText variant="bodySmall" color="ink3" style={styles.noticeText}>
            Lokasi dan waktu tidak dapat diedit.
          </AppText>
        </View>
      )}

      <HandNote size={17} color={colors.ink3}>
        satu foto, satu lokasi, satu waktu
      </HandNote>

      <View style={styles.actions}>
        {!blocked ? (
          <AppButton
            label="Konfirmasi Lokasi"
            iconRight="arrow"
            onPress={() =>
              router.push(tier === 'coarse' ? '/report/accuracy' : '/report/confirm-location')
            }
          />
        ) : (
          <AppButton label="Ambil Ulang Foto" icon="camera" onPress={retake} />
        )}
        <AppText variant="meta" color="ink3" align="center">
          {blocked ? '' : 'Wajib. Tanpa konfirmasi, laporan tidak bisa dikirim.'}
        </AppText>
        {!blocked ? <AppButton label="Ambil Ulang Foto" variant="outline" icon="refresh" onPress={retake} /> : null}
        <AppButton label="Batalkan" variant="ghost" size="small" onPress={cancel} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.lg, paddingTop: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headText: { alignItems: 'center', gap: 2, flex: 1 },
  headSpacer: { width: 44 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  locIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.tile - 4,
    borderWidth: border.heavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locText: { flex: 1, gap: 2 },
  accChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  notice: {
    flexDirection: 'row',
    gap: space.sm,
    borderWidth: 1.4,
    borderRadius: radius.input,
    padding: space.md,
  },
  noticeText: { flex: 1 },
  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actions: { gap: space.sm, marginTop: space.sm },
});
