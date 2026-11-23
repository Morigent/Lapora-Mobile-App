import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BottomNav } from '@/components/navigation/BottomNav';
import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.paper }]}>
      <View style={styles.body}>
        <Slot />
      </View>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  body: { flex: 1 },
});
