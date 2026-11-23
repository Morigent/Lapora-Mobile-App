import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { HandNote } from '@/components/common/HandNote';
import { Icon } from '@/components/common/Icon';
import { IconButton } from '@/components/common/IconButton';
import { PressableScale } from '@/components/common/PressableScale';
import { Screen } from '@/components/common/Screen';
import { border, radius, space } from '@/constants/design';
import { useReportCamera } from '@/features/camera/hooks/useReportCamera';
import { useLocationTracking } from '@/features/location/hooks/useLocationTracking';
import { useTheme } from '@/hooks/use-theme';
import { useCameraStore } from '@/stores/cameraStore';
import { formatAccuracy } from '@/utils/geo';

export default function CameraScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cameraRef, permission, openPermission, capture, busy } = useReportCamera();
  const setLocationFailure = useCameraStore((state) => state.setLocationFailure);
  const { point, accuracyM, request } = useLocationTracking();
  const [error, setError] = useState<string | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const shoot = async () => {
    setError(null);
    const result = await capture();
    if (result.ok) {
      router.push('/report/preview');
      return;
    }
    if (
      result.error.code === 'permission_denied' ||
      result.error.code === 'services_disabled' ||
      result.error.code === 'timeout'
    ) {
      setLocationFailure({ code: result.error.code, message: result.error.message });
      router.push('/report/gps-failed');
      return;
    }
    setError(result.error.message);
  };

  if (!permission) {
    return (
      <Screen style={{ backgroundColor: colors.ink }} topInset contentStyle={styles.permissionContent}>
        <AppText variant="body" color="paper2">
          Memeriksa izin kamera…
        </AppText>
      </Screen>
    );
  }

  if (!permission.granted) {
    const blocked = !permission.canAskAgain;
    return (
      <Screen topInset contentStyle={styles.permissionContent}>
        <View style={styles.permissionHead}>
          <IconButton icon="close" label="Tutup kamera" onPress={() => router.back()} />
          <AppText variant="label" color="ink3">
            {blocked ? 'IZIN DITOLAK' : 'IZIN KAMERA'}
          </AppText>
        </View>
        <View style={[styles.art, { borderColor: colors.ink, backgroundColor: colors.paper2 }]}>
          <Icon name="camera" size={56} color={colors.ink} />
          <View style={[styles.slash, { backgroundColor: colors.accent }]} />
          <HandNote size={16} color={colors.accent} style={styles.artNote}>
            {blocked ? 'izin ditolak' : 'butuh izin'}
          </HandNote>
        </View>
        <AppText variant="h1">{blocked ? 'Izin kamera ditolak' : 'Izin kamera'}</AppText>
        <AppText variant="body" color="ink2">
          {blocked
            ? 'Lapora tidak membuka galeri sebagai pengganti. Tanpa kamera, bukti foto tidak bisa dibuat dan laporan tidak bisa dikirim.'
            : 'Lapora butuh kamera untuk mengambil bukti. Foto harus diambil langsung dari kamera aplikasi — kami tidak membuka galeri atau pemilih file sebagai pengganti.'}
        </AppText>
        <AppCard padding={16} shadow={false}>
          <AppText variant="label" color="ink3">
            CARA MENGIZINKAN
          </AppText>
          {(blocked
            ? ['Buka Pengaturan HP', 'Aplikasi → Lapora', 'Izin → Kamera → Izinkan']
            : ['Tekan tombol izin di bawah', 'Pilih Izinkan saat dialog muncul', 'Kamera terbuka di dalam aplikasi']
          ).map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <View style={[styles.stepNumber, { borderColor: colors.ink }]}>
                <AppText variant="meta">{index + 1}</AppText>
              </View>
              <AppText variant="bodySmall" color="ink2" style={styles.stepText}>
                {step}
              </AppText>
            </View>
          ))}
        </AppCard>
        <AppText variant="bodySmall" color="ink3">
          Akses galeri tidak pernah tersedia di alur laporan.
        </AppText>
        <AppButton
          label={blocked ? 'Buka pengaturan izin' : 'Izinkan kamera'}
          icon="lock"
          onPress={async () => {
            if (blocked) {
              setError('Buka Pengaturan HP → Aplikasi → Lapora → Izin → Kamera, lalu kembali.');
              return;
            }
            const granted = await openPermission();
            if (!granted) setError('Izin belum diberikan. Kamera tetap terkunci.');
          }}
        />
        <AppButton label="Nanti saja" variant="ghost" size="small" onPress={() => router.back()} />
        {error ? (
          <AppText variant="bodySmall" color="accent" align="center">
            {error}
          </AppText>
        ) : null}
      </Screen>
    );
  }

  return (
    <View style={styles.fill}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      <View style={[styles.overlay, { paddingTop: insets.top + 10 }]}>
        <View style={styles.topRow}>
          <IconButton icon="close" label="Tutup kamera" variant="outline" onPress={() => router.back()} />
          <View style={[styles.livePill, { borderColor: colors.paper }]}>
            <View style={[styles.dot, { backgroundColor: colors.accent }]} />
            <AppText variant="meta" color="paper" style={styles.whiteText}>
              KAMERA DALAM APLIKASI
            </AppText>
          </View>
          <IconButton
            icon="flip"
            label="Ganti kamera"
            variant="outline"
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          />
        </View>

        <View style={styles.hud}>
          <AppText variant="meta" color="paper" style={styles.hudText}>
            {facing === 'back' ? 'KAMERA BELAKANG' : 'KAMERA DEPAN'}
          </AppText>
          <View style={[styles.fixPill, { borderColor: colors.paper }]}>
            <Icon name="target" size={12} color={colors.paper} />
            <AppText variant="meta" color="paper" style={styles.hudText}>
              {point ? `${formatAccuracy(accuracyM)} · ${clock.toLocaleTimeString('id-ID', { hour12: false })}` : 'mencari titik GPS…'}
            </AppText>
          </View>
        </View>

        <View style={styles.spacer} />

        <HandNote size={16} color={colors.paper} align="center" style={styles.note}>
          arahkan ke kerusakan, jangan ke langit
        </HandNote>

        {error ? (
          <View style={[styles.errorBox, { borderColor: colors.paper }]}>
            <AppText variant="bodySmall" color="paper" align="center">
              {error}
            </AppText>
          </View>
        ) : null}

        <View style={[styles.bottom, { paddingBottom: insets.bottom + 18 }]}>
          <View style={styles.bottomSide}>
            <View style={[styles.gallerySlot, { borderColor: colors.paper }]}>
              <Icon name="image" size={20} color={colors.paper} />
              <View style={[styles.gallerySlash, { backgroundColor: colors.accent }]} />
            </View>
            <AppText variant="meta" color="paper" style={styles.galleryLabel}>
              galeri
            </AppText>
          </View>

          <PressableScale accessibilityRole="button" accessibilityLabel="Ambil foto" onPress={shoot} disabled={busy}>
            <View style={[styles.shutterRing, { borderColor: colors.paper }]}>
              <View style={[styles.shutterCore, { backgroundColor: busy ? colors.ink3 : colors.paper }]} />
            </View>
          </PressableScale>

          <View style={styles.bottomSide}>
            <PressableScale accessibilityRole="button" accessibilityLabel="Perbarui lokasi" onPress={request}>
              <View style={[styles.gallerySlot, { borderColor: colors.paper }]}>
                <Icon name="target" size={20} color={colors.paper} />
              </View>
            </PressableScale>
            <AppText variant="meta" color="paper" style={styles.galleryLabel}>
              perbarui
            </AppText>
          </View>
        </View>

        <AppText variant="meta" color="paper" align="center" style={[styles.caption, { paddingBottom: insets.bottom + 6 }]}>
          LOKASI & WAKTU DICATAT SAAT TOMBOL INI DITEKAN
        </AppText>
      </View>

      {Platform.OS === 'web' ? (
        <View style={[styles.webHint, { borderColor: colors.paper }]}>
          <AppText variant="meta" color="paper">
            IZIN BROWSER: KAMERA SAJA
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000000' },
  permissionContent: { gap: space.md, paddingTop: space.sm, paddingBottom: space.xxl },
  permissionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  art: {
    height: 148,
    borderRadius: radius.card,
    borderWidth: border.heavy,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slash: { position: 'absolute', width: 200, height: 4, transform: [{ rotate: '-32deg' }] },
  artNote: { position: 'absolute', bottom: 8, right: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  whiteText: { letterSpacing: 1 },
  hud: { marginTop: 12, gap: 6, alignItems: 'flex-start' },
  hudText: { letterSpacing: 1 },
  fixPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  spacer: { flex: 1 },
  note: { marginBottom: 12 },
  errorBox: {
    borderWidth: 1.2,
    borderRadius: radius.tile,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottomSide: { width: 72, gap: 6, alignItems: 'center' },
  gallerySlot: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    opacity: 0.75,
  },
  gallerySlash: { position: 'absolute', width: 66, height: 2.5, transform: [{ rotate: '-38deg' }] },
  galleryLabel: { fontSize: 9, letterSpacing: 1 },
  shutterRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: { width: 60, height: 60, borderRadius: 30 },
  caption: { fontSize: 9, letterSpacing: 1.1, marginTop: 10 },
  webHint: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  hiddenReset: { position: 'absolute', left: -9999 },
});
