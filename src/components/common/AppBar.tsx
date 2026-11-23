import { StyleSheet, View } from 'react-native';

import { border, layout, radius } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

type Props = {
  leftIcon?: IconName;
  onLeftPress?: () => void;
  leftLabel?: string;
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  border?: boolean;
  transparent?: boolean;
};

export function AppBar({
  leftIcon,
  onLeftPress,
  leftLabel = 'Kembali',
  title,
  subtitle,
  right,
  border: showBorder = false,
  transparent,
}: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        {
          borderBottomWidth: showBorder ? border.hair : 0,
          borderBottomColor: colors.paper3,
          backgroundColor: transparent ? 'transparent' : colors.paper,
        },
      ]}
    >
      <View style={styles.side}>
        {leftIcon ? (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={leftLabel}
            onPress={onLeftPress}
            style={styles.iconButton}
          >
            <View
              style={[
                styles.iconInner,
                { borderColor: colors.ink, backgroundColor: colors.paper, borderRadius: radius.tile },
              ]}
            >
              <Icon name={leftIcon} size={20} color={colors.ink} />
            </View>
          </PressableScale>
        ) : null}
      </View>
      <View style={styles.center}>
        {title ? (
          <AppText variant="h3" numberOfLines={1}>
            {title}
          </AppText>
        ) : null}
        {subtitle ? (
          <AppText variant="bodySmall" color="ink3" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.margin,
    gap: 8,
  },
  side: { width: 96, alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconButton: { width: layout.touch, height: layout.touch, justifyContent: 'center' },
  iconInner: {
    width: 36,
    height: 36,
    borderWidth: border.heavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
