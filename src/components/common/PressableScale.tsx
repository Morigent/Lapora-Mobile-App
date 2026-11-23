import { useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { motion } from '@/constants/design';

type Props = Omit<PressableProps, 'children'> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale on press. Disabled for large surfaces that should not move. */
  scaleTo?: number;
  haptic?: boolean;
};

export function PressableScale({ style, scaleTo = motion.pressScale, onPressIn, onPressOut, children, ...rest }: Props) {
  const [scale] = useState(() => new Animated.Value(1));

  const animate = (to: number, duration: number) => {
    Animated.timing(scale, {
      toValue: to,
      duration,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  return (
    <Pressable
      {...rest}
      onPressIn={(event) => {
        animate(scaleTo, motion.pressMs * 0.6);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animate(1, motion.pressMs);
        onPressOut?.(event);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
