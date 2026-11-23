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
import { border, radius, space } from '@/constants/design';
import { DEMO_ACCOUNT } from '@/features/auth/services/authService';
import { useTheme } from '@/hooks/use-theme';
import { isRemoteConfigured } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { validateEmail } from '@/utils/validators';

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { login, loginDemo, pending, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const submit = async () => {
    clearError();
    const problem = validateEmail(email) ?? (password.length < 6 ? 'Kata sandi minimal 6 karakter.' : null);
    setFieldError(problem);
    if (problem) return;
    await login(email, password);
  };

  return (
    <Screen bottomInset contentStyle={styles.content}>
      <View style={styles.brandRow}>
        <View style={[styles.mark, { borderColor: colors.ink, backgroundColor: colors.paper }]}>
          <Icon name="pin" size={20} color={colors.ink} />
        </View>
        <View>
          <AppText variant="h3">Lapora</AppText>
          <AppText variant="meta" color="ink3">
            LAPOR WARGA · LOKAL
          </AppText>
        </View>
      </View>

      <View style={styles.heading}>
        <AppText variant="display">Masuk</AppText>
        <AppText variant="body" color="ink2">
          Lanjutkan laporan terakhirmu dan bantu warga lain.
        </AppText>
        <HandNote size={18} color={colors.ink3}>
          lapor tanpa drama
        </HandNote>
      </View>

      <View style={styles.form}>
        <TextField
          label="Email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setFieldError(null);
          }}
          placeholder="nama@email.com"
          icon="user"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <TextField
          label="Kata sandi"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setFieldError(null);
          }}
          placeholder="Minimal 6 karakter"
          icon="lock"
          secure={!reveal}
          autoComplete="password"
          textContentType="password"
          right={
            <PressableScale accessibilityRole="button" accessibilityLabel="Tampilkan kata sandi" onPress={() => setReveal(!reveal)}>
              <AppText variant="bodySmall" weight="600" color="ink2" style={styles.reveal}>
                {reveal ? 'Sembunyi' : 'Lihat'}
              </AppText>
            </PressableScale>
          }
        />

        {fieldError || error ? (
          <View style={[styles.error, { borderColor: colors.accent }]}>
            <Icon name="alert" size={16} color={colors.accent} />
            <AppText variant="bodySmall" color="accent" style={styles.errorText}>
              {fieldError ?? error}
            </AppText>
          </View>
        ) : null}

        <PressableScale accessibilityRole="button" onPress={() => setFieldError('Pemulihan kata sandi belum tersedia di mode lokal.')}>
          <AppText variant="bodySmall" weight="600" color="ink2" align="right">
            Lupa kata sandi?
          </AppText>
        </PressableScale>

        <AppButton label="Masuk" onPress={submit} loading={pending} iconRight="arrow" />

        <AppCard padding={14} shadow={false} background={colors.paper2}>
          <AppText variant="label" color="ink3">
            AKUN DEMO LOKAL
          </AppText>
          <AppText variant="bodySmall" color="ink2" style={styles.demoLine}>
            {DEMO_ACCOUNT.email} · {DEMO_ACCOUNT.password}
          </AppText>
          <AppButton
            label="Masuk sebagai akun demo"
            variant="outline"
            size="small"
            icon="bolt"
            onPress={() => loginDemo()}
            style={styles.demoButton}
          />
        </AppCard>
      </View>

      <View style={styles.footer}>
        <View style={styles.switchRow}>
          <AppText variant="bodySmall" color="ink3">
            Belum punya akun?
          </AppText>
          <PressableScale accessibilityRole="button" onPress={() => router.push('/(auth)/register')}>
            <AppText variant="bodySmall" weight="600">
              Daftar akun baru
            </AppText>
          </PressableScale>
        </View>
        <View style={styles.note}>
          <Icon name="shield" size={15} color={colors.ink3} />
          <AppText variant="bodySmall" color="ink3" style={styles.noteText}>
            Data lokasi hanya dipakai saat kamu mengambil foto laporan.
          </AppText>
        </View>
        <AppText variant="meta" color="ink3" align="center">
          {isRemoteConfigured
            ? 'Akun disimpan di perangkat ini · laporan dikirim ke server Lapora'
            : 'Akun disimpan di perangkat ini · backend belum tersambung'}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.xxl, paddingTop: space.lg },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  mark: {
    width: 42,
    height: 42,
    borderRadius: radius.tile,
    borderWidth: border.heavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { gap: space.sm, marginTop: space.sm },
  form: { gap: space.lg },
  reveal: { paddingHorizontal: 8 },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1.4,
    borderRadius: radius.input,
    padding: space.md,
  },
  errorText: { flex: 1 },
  demoLine: { marginTop: 2, marginBottom: space.sm },
  demoButton: { alignSelf: 'flex-start' },
  footer: { gap: space.md, marginTop: 'auto' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  note: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  noteText: { flexShrink: 1 },
});
