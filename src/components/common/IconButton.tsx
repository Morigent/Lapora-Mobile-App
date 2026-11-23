import { StyleSheet, View } from 'react-native';

import { border, layout, radius } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

type Props = {
  icon: IconName;
  onPress: () => void;
  label: string;
  size?: number;
  variant?: 'outline' | 'plain';
  color?: string;
  disabled?: boolean;
};

export function IconButton({ icon, onPress, label, size = 40, variant = 'outline', color, disabled }: Props) {
  const { colors } = useTheme();
  const foreground = color ?? colors.ink;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <View
        style={[
          styles.base,
          {
            width: Math.max(size, layout.touch),
            height: Math.max(size, layout.touch),
            borderWidth: variant === 'outline' ? border.heavy : 0,
            borderColor: foreground,
            backgroundColor: variant === 'outline' ? colors.paper : 'transparent',
            borderRadius: radius.tile,
          },
        ]}
      >
        <Icon name={icon} size={22} color={foreground} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
