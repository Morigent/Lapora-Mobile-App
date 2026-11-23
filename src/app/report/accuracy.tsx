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
import { space } from '@/constants/design';
import { ACCURACY_HARD_LIMIT_M, ACCURACY_TARGET_M } from '@/lib/constants';
import { useTheme } from '@/hooks/use-theme';
import { discardSession } from '@/features/camera/services/discardSession';
import { deleteStoredPhoto } from '@/storage/photoStorage';
import { useCameraStore } from '@/stores/cameraStore';
import { formatAccuracy } from '@/utils/geo';

/** Design screen 08 — coarse fix (25–50 m) needs an explicit decision. */
export default function AccuracyScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const focused = useIsFocused();
  const session = useCameraStore((state) => state.session);
  const confirmSession = useCameraStore((state) => state.confirmSession);
  const reset = useCameraStore((state) => state.reset);

  useEffect(() => {
    if (!session && focused) router.replace('/report/camera');
  }, [session, focused, router]);

  if (!session) return null;

  const accuracyM = session.metadata.accuracyM ?? ACCURACY_HARD_LIMIT_M;
  const ratio = Math.min(1, accuracyM / ACCURACY_HARD_LIMIT_M);

  const retake = async () => {
    await discardSession({ session, reset, deletePhoto: deleteStoredPhoto });
    router.replace('/report/camera');
  };

  const cancel = async () => {
    await discardSession({ session, reset, deletePhoto: deleteStoredPhoto });
    router.replace('/(tabs)/home');
  };

  return (
    <Screen bottomInset contentStyle={styles.content}>
      <View style={styles.head}>
        <IconButton icon="close" label="Batalkan laporan" onPress={cancel} />
        <AppText variant="label" color="ink3">
          AKURASI
        </AppText>
        <View style={styles.headSpacer} />
      </View>

      <View style={styles.heading}>
        <AppText variant="display">Akurasi lokasi rendah</AppText>
        <View style={styles.meterRow}>
          <AppText variant="h2" color="accent">
            {formatAccuracy(accuracyM)}
          </AppText>
          <AppText variant="bodySmall" color="ink3">
            · ambang {ACCURACY_TARGET_M} m
          </AppText>
        </View>
        <AppText variant="body" color="ink2">
          Sinyal GPS masih kasar. Laporan tetap bisa dikirim, tetapi tim lapangan sulit menemukan titik kerusakan.
        </AppText>
      </View>

      <AppCard padding={16} background={colors.paper2} shadow={false}>
        <View style={[styles.track, { backgroundColor: colors.paper3 }]}>
          <View
            style={[
              styles.fill,
              { width: `${ratio * 100}%`, backgroundColor: accuracyM > ACCURACY_TARGET_M ? colors.accent : colors.ink },
            ]}
          />
          {[0, ACCURACY_TARGET_M, ACCURACY_HARD_LIMIT_M].map((mark, index) => (
            <View
              key={mark}
              style={[
                styles.tick,
                {
                  left: `${(mark / ACCURACY_HARD_LIMIT_M) * 100}%`,
                  backgroundColor: index === 1 ? colors.ink : colors.ink3,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.scaleRow}>
          <AppText variant="meta" color="ink3">
            0
          </AppText>
          <AppText variant="meta" color="ink3">
            {ACCURACY_TARGET_M} m
          </AppText>
          <AppText variant="meta" color="ink3">
            {ACCURACY_HARD_LIMIT_M} m
          </AppText>
        </View>
        <View style={styles.legend}>
          <Icon name="target" size={13} color={colors.ink} />
          <AppText variant="bodySmall" color="ink2" style={styles.legendText}>
            Akurasi disimpan apa adanya di metadata laporan.
          </AppText>
        </View>
      </AppCard>

      <HandNote size={16} color={colors.ink3}>
        ambang batas tim
      </HandNote>

      <AppText variant="bodySmall" color="ink3">
        Coba ulang di area terbuka, atau tunggu beberapa detik sebelum menekan tombol kamera.
      </AppText>

      <View style={styles.actions}>
        <AppButton
          label="Tetap gunakan lokasi ini"
          iconRight="check"
          onPress={() => {
            confirmSession();
            router.replace('/report/details');
          }}
        />
        <AppButton label="Ambil Ulang Foto" variant="outline" icon="camera" onPress={retake} />
        <AppButton label="Batalkan" variant="ghost" size="small" onPress={cancel} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.lg, paddingTop: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headSpacer: { width: 44 },
  heading: { gap: space.sm },
  meterRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  track: { height: 12, borderRadius: 6, overflow: 'hidden' },
  fill: { height: 12, borderRadius: 6 },
  tick: { position: 'absolute', top: 0, bottom: 0, width: 2 },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md },
  legendText: { flex: 1 },
  actions: { gap: space.sm },
});
