import { useIsFocused, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { HandNote } from '@/components/common/HandNote';
import { Icon } from '@/components/common/Icon';
import { IconButton } from '@/components/common/IconButton';
import { Screen } from '@/components/common/Screen';
import { border, radius, space } from '@/constants/design';
import { discardSession } from '@/features/camera/services/discardSession';
import { mismatchDistance } from '@/features/camera/services/evidenceGate';
import { locationVerdict } from '@/features/location/services/locationConfirmation';
import { getFreshFix } from '@/features/location/services/locationService';
import { useTheme } from '@/hooks/use-theme';
import { deleteStoredPhoto } from '@/storage/photoStorage';
import { useCameraStore } from '@/stores/cameraStore';
import { formatCoordinates, formatTime } from '@/utils/date';
import { formatAccuracy, formatDistance } from '@/utils/geo';

type Probe = { distanceM: number; accuracyM: number | null; at: string } | { error: string };

/** Design screen 07 — the location is checked, never edited. */
export default function ConfirmLocationScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const focused = useIsFocused();
  const session = useCameraStore((state) => state.session);
  const confirmSession = useCameraStore((state) => state.confirmSession);
  const reset = useCameraStore((state) => state.reset);
  const [probe, setProbe] = useState<Probe | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!session) {
      if (focused) router.replace('/report/camera');
      return;
    }
    (async () => {
      const result = await getFreshFix();
      if (!result.ok) {
        setProbe({ error: result.error.message });
        return;
      }
      setProbe({
        distanceM: mismatchDistance(session, result.fix.point),
        accuracyM: result.fix.accuracyM,
        at: result.fix.measuredAt,
      });
    })();
  }, [session, focused, router]);

  if (!session) return null;

  const verdict = locationVerdict(probe, accepted);
  const { mismatched } = verdict;

  const confirm = () => {
    confirmSession();
    router.replace('/report/details');
  };

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
          LOKASI
        </AppText>
        <View style={styles.headSpacer} />
      </View>

      <View style={styles.heading}>
        <AppText variant="display">{verdict.heading}</AppText>
        <AppText variant="body" color="ink2">
          {verdict.explanation}
        </AppText>
      </View>

      <AppCard padding={16} background={colors.paper2} shadow={false}>
        <View style={styles.pinRow}>
          <View style={[styles.pinIcon, { borderColor: mismatched ? colors.accent : colors.ink }]}>
            <Icon name="pin" size={20} color={mismatched ? colors.accent : colors.ink} />
          </View>
          <View style={styles.pinText}>
            <AppText variant="meta" color="ink3">
              PIN FOTO
            </AppText>
            <AppText variant="bodySmall" weight="600">
              {formatCoordinates(session.metadata.point.latitude, session.metadata.point.longitude)}
            </AppText>
          </View>
          <AppText variant="meta" color="ink3">
            {formatTime(session.metadata.locationMeasuredAt)}
          </AppText>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.paper3 }]} />

        {probe == null ? (
          <AppText variant="bodySmall" color="ink3">
            Mengukur ulang titik GPS…
          </AppText>
        ) : 'error' in probe ? (
          <AppText variant="bodySmall" color="accent">
            {probe.error} — lokasi pin tetap memakai pengukuran saat foto diambil.
          </AppText>
        ) : (
          <>
            {mismatched ? (
              <AppText variant="bodySmall" color="accent" style={styles.mismatchText}>
                Pin berada {formatDistance(probe.distanceM)} dari titik GPS sekarang.
              </AppText>
            ) : (
              <AppText variant="bodySmall" color="ink2" style={styles.mismatchText}>
                Selisih {formatDistance(probe.distanceM)} dari titik GPS sekarang — masih toleransi.
              </AppText>
            )}
            <View style={styles.deltaRow}>
              <Delta label="Jarak" value={formatDistance(probe.distanceM)} />
              <Delta label="Akurasi" value={formatAccuracy(session.metadata.accuracyM)} />
              <Delta label="Waktu" value={formatTime(session.metadata.locationMeasuredAt)} />
            </View>
          </>
        )}
      </AppCard>

      {verdict.needsAcknowledgement ? (
        <HandNote size={17} color={colors.accent}>
          pin di lokasi foto, bukan lokasi sekarang
        </HandNote>
      ) : null}

      <View style={styles.actions}>
        {verdict.canConfirm ? (
          <AppButton label="Konfirmasi Lokasi" iconRight="arrow" onPress={confirm} />
        ) : (
          <AppButton label="Gunakan lokasi foto" iconRight="check" onPress={() => setAccepted(true)} />
        )}
        <AppButton label="Ambil Ulang Foto" variant="outline" icon="camera" onPress={retake} />
        <AppButton label="Batalkan" variant="ghost" size="small" onPress={cancel} />
        <AppText variant="meta" color="ink3" align="center">
          Lokasi dan waktu tetap tidak dapat diedit manual.
        </AppText>
      </View>
    </Screen>
  );
}

function Delta({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.delta, { borderColor: colors.paper3 }]}>
      <AppText variant="meta" color="ink3">
        {label.toUpperCase()}
      </AppText>
      <AppText variant="bodySmall" weight="600">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.lg, paddingTop: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headSpacer: { width: 44 },
  heading: { gap: space.sm },
  pinRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pinIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.tile - 4,
    borderWidth: border.heavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinText: { flex: 1, gap: 2 },
  divider: { height: 1, marginVertical: space.md },
  mismatchText: { marginBottom: space.sm },
  deltaRow: { flexDirection: 'row', gap: space.sm },
  delta: { flex: 1, borderWidth: 1.2, borderRadius: radius.tile - 4, padding: space.sm, gap: 2 },
  actions: { gap: space.sm, marginTop: space.sm },
});
