import { useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { border, radius as radiusTokens } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { wobbleRectPath } from '@/utils/sketch';

import { PressableScale } from './PressableScale';

type RadiusKey = keyof typeof radiusTokens;

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padding?: number;
  background?: string;
  borderColor?: string;
  radius?: RadiusKey | number;
  shadow?: boolean;
  wobble?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function WobbleBorder({
  width,
  height,
  radius,
  color,
  seed,
  thickness = border.heavy,
  dashed = false,
  amplitude = 1.6,
}: {
  width: number;
  height: number;
  radius: number;
  color: string;
  seed: string;
  thickness?: number;
  dashed?: boolean;
  amplitude?: number;
}) {
  if (width < 4 || height < 4) return null;
  const pad = 3;
  const d = wobbleRectPath(
    width - pad * 2,
    height - pad * 2,
    Math.max(2, radius - pad),
    seed,
    amplitude,
  );
  return (
    <Svg
      pointerEvents="none"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={StyleSheet.absoluteFill}
    >
      <Path
        d={d}
        transform={`translate(${pad} ${pad})`}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={dashed ? '6 5' : undefined}
      />
    </Svg>
  );
}

export function AppCard({
  children,
  style,
  padding = 16,
  background,
  borderColor,
  radius = 'card',
  shadow = true,
  wobble = true,
  onPress,
  accessibilityLabel,
}: Props) {
  const { colors } = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const r = typeof radius === 'number' ? radius : radiusTokens[radius];
  const body = (
    <View style={{ paddingRight: shadow ? 4 : 0, paddingBottom: shadow ? 4 : 0 }}>
      <View
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          if (width !== size.width || height !== size.height) setSize({ width, height });
        }}
        style={{ backgroundColor: background ?? colors.paper, borderRadius: r }}
      >
        {wobble ? (
          <WobbleBorder
            width={size.width}
            height={size.height}
            radius={r}
            color={borderColor ?? colors.ink}
            seed={`card-${r}-${Math.round(size.width)}`}
          />
        ) : (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: r, borderWidth: border.heavy, borderColor: borderColor ?? colors.ink },
            ]}
          />
        )}
        <View style={{ padding }}>{children}</View>
      </View>
      {shadow ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ translateX: 4 }, { translateY: 4 }],
              backgroundColor: colors.ink,
              borderRadius: r,
              zIndex: -1,
            },
          ]}
        />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={style}
      >
        {body}
      </PressableScale>
    );
  }
  return <View style={style}>{body}</View>;
}
