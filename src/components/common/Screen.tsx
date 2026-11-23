import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  gutter?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  topInset?: boolean;
  bottomInset?: boolean;
  background?: string;
  refreshControl?: React.ReactElement;
};

export function Screen({
  children,
  scroll = true,
  gutter = layout.margin,
  style,
  contentStyle,
  topInset = true,
  bottomInset = false,
  background,
  refreshControl,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const paddingTop = (topInset ? insets.top : 0) + 12;
  const paddingBottom = (bottomInset ? insets.bottom : 0) + 24;

  if (!scroll) {
    return (
      <View
        style={[
          styles.fill,
          { backgroundColor: background ?? colors.paper, paddingTop, paddingHorizontal: gutter },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.fill, { backgroundColor: background ?? colors.paper }, style]}
      contentContainerStyle={[{ paddingTop, paddingBottom, paddingHorizontal: gutter }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
