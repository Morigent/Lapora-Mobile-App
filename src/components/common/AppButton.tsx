import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { border, layout, radius, type as typeScale } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'large' | 'small';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  haptic?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'large',
  icon,
  iconRight,
  disabled,
  loading,
  haptic = true,
  fullWidth = true,
  style,
  accessibilityHint,
}: Props) {
  const { colors } = useTheme();
  const height = size === 'large' ? layout.buttonHeight : layout.buttonSmallHeight;
  const text = typeScale[size === 'large' ? 'button' : 'buttonSmall'];

  const bg =
    variant === 'primary' || variant === 'danger'
      ? colors.accent
      : variant === 'outline'
        ? colors.paper
        : 'transparent';
  const fg = variant === 'primary' || variant === 'danger' ? colors.paper : colors.ink;

  const trigger = () => {
    if (disabled || loading) return;
    if (haptic && Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
      disabled={disabled || loading}
      onPress={trigger}
      style={[{ opacity: disabled ? 0.42 : 1, width: fullWidth ? '100%' : undefined }, style]}
    >
      <View
        style={[
          styles.base,
          {
            height,
            backgroundColor: bg,
            borderWidth: variant === 'ghost' ? 0 : border.heavy,
            borderColor: colors.ink,
            borderRadius: radius.button,
            opacity: loading ? 0.72 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={fg} size="small" />
        ) : (
          <>
            {icon ? <Icon name={icon} size={size === 'large' ? 20 : 17} color={fg} strokeWidth={2.2} /> : null}
            <AppText
              style={[text, { color: fg }]}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {label}
            </AppText>
            {iconRight ? (
              <Icon name={iconRight} size={size === 'large' ? 20 : 17} color={fg} strokeWidth={2.2} />
            ) : null}
          </>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
    minHeight: layout.touch,
  },
});
