import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { font } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { underlinePath } from '@/utils/sketch';

import { AppText } from './AppText';

type Props = {
  children: string;
  underline?: boolean;
  color?: string;
  align?: 'left' | 'center' | 'right';
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** Caveat handwriting note. Design allows 2–3 per screen, never for required copy. */
export function HandNote({ children, underline = false, color, align = 'left', size = 17, style }: Props) {
  const { colors } = useTheme();
  const tint = color ?? colors.ink3;
  return (
    <View style={[styles.wrap, { alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }, style]}>
      <AppText
        style={{ fontFamily: font.hand, fontSize: size, lineHeight: size * 1.35, color: tint }}
        align={align}
      >
        {children}
      </AppText>
      {underline ? (
        <Svg width={Math.min(220, children.length * size * 0.42)} height={5} viewBox="0 0 220 5" preserveAspectRatio="none" style={styles.underline}>
          <Path
            d={underlinePath(220, children, 0.9)}
            stroke={tint}
            strokeWidth={1.4}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 1 },
  underline: { marginTop: -2 },
});
