import { StyleSheet, View } from 'react-native';

import { border, radius as radiusTokens, type as typeScale } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  size?: 'small' | 'medium';
  tone?: 'solid' | 'outline' | 'soft';
  dashed?: boolean;
};

export function AppChip({ label, selected = false, onPress, icon, size = 'medium', tone = 'outline', dashed }: Props) {
  const { colors } = useTheme();
  const solid = tone === 'solid' || selected;
  const background = solid ? colors.ink : tone === 'soft' ? colors.paper2 : colors.paper;
  const foreground = solid ? colors.paper : colors.ink2;
  const height = size === 'small' ? 28 : 34;

  const body = (
    <View
      style={[
        styles.chip,
        {
          height,
          backgroundColor: background,
          borderColor: solid ? colors.ink : dashed ? colors.ink3 : colors.ink,
          borderWidth: solid ? border.heavy : dashed ? border.dashed : 1.8,
          borderStyle: dashed && !solid ? 'dashed' : 'solid',
          borderRadius: radiusTokens.pill,
        },
      ]}
    >
      {icon ? <Icon name={icon} size={size === 'small' ? 13 : 15} color={foreground} /> : null}
      <AppText
        style={[size === 'small' ? typeScale.meta : typeScale.bodySmall, { color: foreground, letterSpacing: 0 }]}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </View>
  );

  if (!onPress) return body;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
    >
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
});
