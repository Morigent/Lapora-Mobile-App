import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { border, radius } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

import { AppButton } from './AppButton';
import { AppCard } from './AppCard';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export function Skeleton({ width, height, radius: r = 8, style }: { width: number | `${number}%`; height: number; radius?: number; style?: ViewStyle }) {
  const { colors } = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.55));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 720, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacity, { toValue: 0.55, duration: 720, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: r, backgroundColor: colors.paper3, opacity }, style]}
    />
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <View style={styles.block}>
      <Skeleton width={168} height={16} />
      <View style={styles.skeletonList}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.skeletonRow}>
            <Skeleton width={72} height={72} radius={10} />
            <View style={styles.skeletonLines}>
              <Skeleton width="86%" height={12} />
              <Skeleton width="64%" height={12} />
              <Skeleton width="42%" height={10} />
            </View>
          </View>
        ))}
      </View>
      <AppText variant="bodySmall" color="ink2">
        {label}
      </AppText>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  footnote,
  children,
}: {
  icon: IconName;
  title: string;
  body: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  footnote?: string;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.stateWrap}>
      <View style={[styles.iconCircle, { borderColor: colors.ink, backgroundColor: colors.paper2 }]}>
        <Icon name={icon} size={38} color={colors.ink} />
      </View>
      <AppText variant="h2" align="center" style={styles.stateTitle}>
        {title}
      </AppText>
      <AppText variant="body" color="ink2" align="center">
        {body}
      </AppText>
      {children}
      {primaryLabel ? <AppButton label={primaryLabel} onPress={onPrimary} /> : null}
      {secondaryLabel ? (
        <AppButton label={secondaryLabel} onPress={onSecondary} variant="ghost" size="small" />
      ) : null}
      {footnote ? (
        <AppText variant="bodySmall" color="ink3" align="center">
          {footnote}
        </AppText>
      ) : null}
    </View>
  );
}

export function ErrorState({
  icon = 'alert',
  title,
  body,
  rows,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  tertiaryLabel,
  onTertiary,
  footnote,
  tone = 'accent',
}: {
  icon?: IconName;
  title: string;
  body: string;
  rows?: { label: string; value: string; accent?: boolean }[];
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  tertiaryLabel?: string;
  onTertiary?: () => void;
  footnote?: string;
  tone?: 'accent' | 'ink';
}) {
  const { colors } = useTheme();
  const tint = tone === 'accent' ? colors.accent : colors.ink;
  return (
    <View style={styles.stateWrap}>
      <View style={[styles.iconCircle, { borderColor: tint }]}>
        <Icon name={icon} size={40} color={tint} />
      </View>
      <AppText variant="h2" align="center">
        {title}
      </AppText>
      <AppText variant="body" color="ink2" align="center">
        {body}
      </AppText>
      {rows ? (
        <AppCard shadow={false} style={styles.fullWidth} padding={14}>
          {rows.map((row, index) => (
            <View
              key={row.label}
              style={[
                styles.detailRow,
                index < rows.length - 1 ? { borderBottomWidth: border.hair, borderBottomColor: colors.paper3 } : null,
              ]}
            >
              <AppText variant="bodySmall" color="ink3">
                {row.label}
              </AppText>
              <AppText variant="bodySmall" color={row.accent ? 'accent' : 'ink'} weight="600">
                {row.value}
              </AppText>
            </View>
          ))}
        </AppCard>
      ) : null}
      {primaryLabel ? <AppButton label={primaryLabel} onPress={onPrimary} /> : null}
      {secondaryLabel ? (
        <AppButton label={secondaryLabel} onPress={onSecondary} variant="ghost" size="small" />
      ) : null}
      {tertiaryLabel ? (
        <AppButton label={tertiaryLabel} onPress={onTertiary} variant="ghost" size="small" />
      ) : null}
      {footnote ? (
        <AppText variant="bodySmall" color="ink3" align="center">
          {footnote}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 16 },
  skeletonList: { gap: 12 },
  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderWidth: border.hair,
    borderRadius: radius.tile,
  },
  skeletonLines: { flex: 1, justifyContent: 'space-between', paddingVertical: 4 },
  stateWrap: { alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 8 },
  stateTitle: { marginTop: 4 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  fullWidth: { alignSelf: 'stretch', marginVertical: 4 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
});
