import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { Icon } from '@/components/common/Icon';
import { Screen } from '@/components/common/Screen';
import { border, radius, space } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={[styles.mark, { borderColor: colors.ink }]}>
        <Icon name="search" size={32} color={colors.ink} />
      </View>
      <AppText variant="h1" align="center">
        Halaman tidak ditemukan
      </AppText>
      <AppText variant="body" color="ink2" align="center">
        Tautan ini tidak tersedia di Lapora. Kembali ke beranda untuk melanjutkan.
      </AppText>
      <AppButton label="Kembali ke beranda" onPress={() => router.replace('/(tabs)/home')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', justifyContent: 'center', gap: space.md },
  mark: {
    width: 72,
    height: 72,
    borderRadius: radius.card,
    borderWidth: border.heavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
