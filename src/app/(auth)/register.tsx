import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { HandNote } from '@/components/common/HandNote';
import { Icon } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { Screen } from '@/components/common/Screen';
import { TextField } from '@/components/common/TextField';
import { Toggle } from '@/components/common/Toggle';
import { border, radius, space } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { isRemoteConfigured } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import {
  firstError,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '@/utils/validators';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { register, pending, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [notifyOnStatus, setNotifyOnStatus] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const submit = async () => {
    clearError();
    const problem = firstError({
      name: validateName(name),
      email: validateEmail(email),
      phone: validatePhone(phone),
      password: validatePassword(password),
    });
    setFieldError(problem);
    if (problem) return;
    await register({ name, email, phone, password, isPublic, notifyOnStatus });
  };

  return (
    <Screen bottomInset contentStyle={styles.content}>
      <View style={styles.top}>
        <PressableScale accessibilityRole="button" accessibilityLabel="Kembali ke masuk" onPress={() => router.back()}>
          <View style={[styles.back, { borderColor: colors.ink }]}>
            <Icon name="back" size={20} color={colors.ink} />
          </View>
        </PressableScale>
        <AppText variant="label" color="ink3">
          LANGKAH 1 DARI 1
        </AppText>
      </View>

      <View style={styles.heading}>
        <AppText variant="display">Buat akun warga</AppText>
        <AppText variant="body" color="ink2">
          Satu akun untuk melaporkan dan memantau tindak lanjut.
        </AppText>
      </View>

      <View style={styles.form}>
        <TextField label="Nama lengkap" value={name} onChangeText={setName} placeholder="Nama sesuai KTP" icon="user" autoCapitalize="words" />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="nama@email.com"
          icon="signal"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextField
          label="Nomor telepon"
          value={phone}
          onChangeText={setPhone}
          placeholder="0812 3456 7890"
          icon="bell"
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <TextField
          label="Kata sandi"
          value={password}
          onChangeText={setPassword}
          placeholder="Minimal 8 karakter"
          icon="lock"
          secure
          hint="Simpan baik-baik. Akun ini hanya ada di perangkatmu."
        />

        <AppCard padding={0} shadow={false}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <AppText variant="bodySmall" weight="600">
                Saya setuju laporan saya tampil publik
              </AppText>
              <AppText variant="bodySmall" color="ink3">
                Tanpa nama lengkap di peta publik.
              </AppText>
            </View>
            <Toggle value={isPublic} onChange={setIsPublic} label="Laporan tampil publik" />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.paper3 }]} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <AppText variant="bodySmall" weight="600">
                Kirim notifikasi status laporan
              </AppText>
              <AppText variant="bodySmall" color="ink3">
                {isRemoteConfigured
                  ? 'Dikirim saat status laporan berubah. Bisa diubah nanti di Info.'
                  : 'Backend belum tersambung — perubahan status hanya terlihat di aplikasi ini.'}
              </AppText>
            </View>
            <Toggle value={notifyOnStatus} onChange={setNotifyOnStatus} label="Kirim notifikasi status" />
          </View>
        </AppCard>

        {fieldError || error ? (
          <View style={[styles.error, { borderColor: colors.accent }]}>
            <Icon name="alert" size={16} color={colors.accent} />
            <AppText variant="bodySmall" color="accent" style={styles.errorText}>
              {fieldError ?? error}
            </AppText>
          </View>
        ) : null}

        <AppButton label="Buat akun" onPress={submit} loading={pending} iconRight="arrow" />
      </View>

      <View style={styles.footer}>
        <HandNote size={16}>email dipakai untuk verifikasi warga</HandNote>
        <View style={styles.switchRow}>
          <AppText variant="bodySmall" color="ink3">
            Sudah punya akun?
          </AppText>
          <PressableScale accessibilityRole="button" onPress={() => router.back()}>
            <AppText variant="bodySmall" weight="600">
              Masuk
            </AppText>
          </PressableScale>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.xl, paddingTop: space.lg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.tile,
    borderWidth: border.heavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { gap: space.sm },
  form: { gap: space.lg },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  toggleText: { flex: 1, gap: 2 },
  divider: { height: 1, marginHorizontal: space.lg },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1.4,
    borderRadius: radius.input,
    padding: space.md,
  },
  errorText: { flex: 1 },
  footer: { gap: space.md },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
});
