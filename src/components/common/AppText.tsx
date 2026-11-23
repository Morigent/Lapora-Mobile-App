import { Text, type TextProps, type TextStyle } from 'react-native';

import { type Colors, font, type as typeScale } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

type Variant = keyof typeof typeScale;
type ColorKey = keyof Colors;

type Props = TextProps & {
  variant?: Variant;
  color?: ColorKey | string;
  align?: TextStyle['textAlign'];
  uppercase?: boolean;
  /** Opt-in caveat handwriting face without changing size. */
  hand?: boolean;
  weight?: '400' | '500' | '600' | '700' | '800';
};

const weightMap = {
  '400': font.body,
  '500': font.bodyMedium,
  '600': font.displaySemi,
  '700': font.displayBold,
  '800': font.display,
} as const;

export function AppText({
  variant = 'body',
  color = 'ink',
  align,
  uppercase,
  hand,
  weight,
  style,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const resolved = (colors as Record<string, string>)[color] ?? color;
  return (
    <Text
      {...rest}
      style={[
        typeScale[variant],
        { color: resolved },
        align ? { textAlign: align } : null,
        uppercase ? { textTransform: 'uppercase' } : null,
        hand ? { fontFamily: font.hand } : null,
        weight ? { fontFamily: weightMap[weight] } : null,
        style,
      ]}
    />
  );
}
