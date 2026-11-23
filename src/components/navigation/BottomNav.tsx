import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/common/AppText';
import { Icon, type IconName } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { border, radius } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

const ITEMS: { key: string; label: string; icon: IconName; href: string }[] = [
  { key: 'home', label: 'Beranda', icon: 'home', href: '/(tabs)/home' },
  { key: 'map', label: 'Peta', icon: 'map', href: '/(tabs)/map' },
  { key: 'history', label: 'Riwayat', icon: 'clock', href: '/(tabs)/history' },
  { key: 'profile', label: 'Info', icon: 'info', href: '/(tabs)/profile' },
];

export function BottomNav() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.paper,
          borderTopColor: colors.ink,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.row}>
        {ITEMS.slice(0, 2).map(({ key, ...item }) => (
          <NavItem key={key} {...item} active={pathname.includes(key)} />
        ))}

        <View style={styles.centerSlot}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Lapor kerusakan"
            onPress={() => router.push('/report/camera')}
          >
            <View style={[styles.action, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
              <Icon name="camera" size={24} color={colors.paper} />
            </View>
          </PressableScale>
          <AppText variant="meta" color="ink" style={styles.actionLabel}>
            LAPOR
          </AppText>
        </View>

        {ITEMS.slice(2).map(({ key, ...item }) => (
          <NavItem key={key} {...item} active={pathname.includes(key)} />
        ))}
      </View>
    </View>
  );
}

function NavItem({ label, icon, href, active }: { label: string; icon: IconName; href: string; active: boolean }) {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <PressableScale
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={() => router.replace(href as never)}
      style={styles.item}
    >
      <Icon name={icon} size={22} color={active ? colors.ink : colors.ink3} />
      <AppText variant="meta" color={active ? 'ink' : 'ink3'} style={[styles.label, active ? styles.labelActive : null]}>
        {label.toUpperCase()}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: border.heavy, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 8 },
  item: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4, minHeight: 44 },
  label: { fontSize: 9.5, letterSpacing: 0.8 },
  labelActive: { letterSpacing: 0.9 },
  centerSlot: { flex: 1, alignItems: 'center', gap: 3, marginTop: -26 },
  action: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    borderWidth: border.heavy,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111111',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  actionLabel: { fontSize: 9.5, letterSpacing: 0.8 },
});
