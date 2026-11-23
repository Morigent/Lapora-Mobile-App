import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Icon } from '@/components/common/Icon';
import { Screen } from '@/components/common/Screen';
import { Toggle } from '@/components/common/Toggle';
import { border, radius, space } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { isRemoteConfigured } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const error = useAuthStore((state) => state.error);
  const logout = useAuthStore((state) => state.logout);

  if (!profile) return null;

  const initial = profile.name.trim().charAt(0).toUpperCase() || 'R';

  return (
    <Screen bottomInset contentStyle={styles.content}>
      <AppText variant="h1">Info</AppText>

      <AppCard padding={16}>
        <View style={styles.identity}>
          <View style={[styles.avatar, { borderColor: colors.ink, backgroundColor: colors.paper2 }]}>
            <AppText variant="h2">{initial}</AppText>
          </View>
          <View style={styles.identityText}>
            <AppText variant="h2">{profile.name}</AppText>
            <AppText variant="bodySmall" color="ink3">
              Warga · {profile.email}
            </AppText>
            <AppText variant="bodySmall" color="ink3">
              {profile.phone}
            </AppText>
          </View>
        </View>
      </AppCard>

      <View style={styles.section}>
        <AppText variant="label" color="ink3">
          PREFERENSI
        </AppText>
        <AppCard padding={0} shadow={false}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <AppText variant="bodySmall" weight="600">
                Laporan baru tampil publik
              </AppText>
              <AppText variant="bodySmall" color="ink3">
                Default saat kamu membuat laporan. Nama lengkap tidak pernah ditampilkan di peta.
              </AppText>
            </View>
            <Toggle
              value={profile.isPublic}
              onChange={(value) => void updateProfile({ isPublic: value })}
              label="Laporan baru tampil publik"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.paper3 }]} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <AppText variant="bodySmall" weight="600">
                Notifikasi perubahan status
              </AppText>
              <AppText variant="bodySmall" color="ink3">
                {isRemoteConfigured
                  ? 'Perubahan status juga dikirim ke akun ini oleh server.'
                  : 'Backend belum tersambung — status hanya berubah lewat pembaruan lokal.'}
              </AppText>
            </View>
            <Toggle
              value={profile.notifyOnStatus}
              onChange={(value) => void updateProfile({ notifyOnStatus: value })}
              label="Notifikasi perubahan status"
            />
          </View>
        </AppCard>
        {error ? (
          <View style={[styles.saveError, { borderColor: colors.accent }]}>
            <Icon name="alert" size={16} color={colors.accent} />
            <AppText variant="bodySmall" color="accent" style={styles.saveErrorText}>
              {error}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <AppText variant="label" color="ink3">
          TENTANG APLIKASI
        </AppText>
        <AppCard padding={16} shadow={false} background={colors.paper2}>
          <View style={styles.aboutRow}>
            <Icon name="shield" size={16} color={colors.ink} />
            <AppText variant="bodySmall" color="ink2" style={styles.aboutText}>
              Foto bukti hanya bisa diambil dari kamera dalam aplikasi, disimpan sementara, dan dikirim bersama lokasi
              serta waktu yang terkunci.
            </AppText>
          </View>
          <View style={styles.aboutRow}>
            <Icon name="info" size={16} color={colors.ink} />
            <AppText variant="bodySmall" color="ink2" style={styles.aboutText}>
              {isRemoteConfigured
                ? 'Laporan dikirim ke server Lapora setelah foto dan metadata terverifikasi. Salinan lokal tetap disimpan di perangkat ini.'
                : 'Data laporan tersimpan di perangkat ini. Backend belum tersambung, jadi status tidak berubah otomatis.'}
            </AppText>
          </View>
        </AppCard>
      </View>

      <View style={styles.section}>
        <AppText variant="label" color="ink3">
          LAINNYA
        </AppText>
        <AppButton
          label="Area rawan bencana"
          variant="outline"
          icon="alert"
          onPress={() => router.push('/(tabs)/hazard')}
        />
        <AppButton
          label="Keluar"
          variant="ghost"
          icon="lock"
          onPress={async () => {
            await logout();
            router.replace('/(auth)/login');
          }}
        />
        <AppText variant="meta" color="ink3" align="center">
          {isRemoteConfigured ? 'Lapora · mode server + lokal' : 'Lapora · mode lokal · data tidak dikirim ke server'}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.lg },
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.tile,
    borderWidth: border.heavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: { flex: 1, gap: 1 },
  section: { gap: space.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  toggleText: { flex: 1, gap: 2 },
  divider: { height: 1, marginHorizontal: space.lg },
  aboutRow: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', paddingVertical: 4 },
  aboutText: { flex: 1 },
  saveError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: border.heavy,
    borderRadius: radius.tile,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  saveErrorText: { flex: 1 },
});
