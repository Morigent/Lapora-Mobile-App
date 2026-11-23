import { StyleSheet, View } from 'react-native';

import { border, radius } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale } from './PressableScale';

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
};

export function Toggle({ value, onChange, label, disabled }: Props) {
  const { colors } = useTheme();
  return (
    <PressableScale
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <View
        style={[
          styles.track,
          {
            backgroundColor: value ? colors.ink : colors.paper2,
            borderColor: value ? colors.ink : colors.ink3,
            borderRadius: radius.pill,
          },
        ]}
      >
        <View
          style={[
            styles.knob,
            {
              backgroundColor: value ? colors.paper : colors.ink3,
              transform: [{ translateX: value ? 18 : 0 }],
            },
          ]}
        />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 46,
    height: 28,
    borderWidth: border.heavy,
    padding: 3,
    justifyContent: 'center',
  },
  knob: { width: 16, height: 16, borderRadius: 8 },
});
