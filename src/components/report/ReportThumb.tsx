import { Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Icon } from '@/components/common/Icon';
import { border, radius } from '@/constants/design';
import { REPORT_CATEGORIES } from '@/constants/reportMeta';
import { useTheme } from '@/hooks/use-theme';
import { type Report } from '@/types/report';

/** 64 px evidence tile: real photo when the row has one, hand-drawn map otherwise. */
export function ReportThumb({ report, size = 64 }: { report: Report; size?: number }) {
  const { colors } = useTheme();
  const category = REPORT_CATEGORIES.find((item) => item.id === report.categoryId);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderColor: colors.paper3,
          backgroundColor: colors.paper2,
          borderRadius: radius.tile - 4,
        },
      ]}
    >
      {report.photoPath ? (
        <Image source={{ uri: report.photoPath }} style={styles.image} resizeMode="cover" />
      ) : (
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Rect width={64} height={64} fill={colors.paper2} />
          <Path d="M0 22 H64 M0 44 H64 M20 0 V64 M45 0 V64" stroke={colors.grid} strokeWidth={2} />
          <Path d="M-4 48 C 14 40 20 30 34 26 C 44 23 52 14 68 10" stroke={colors.road} strokeWidth={7} fill="none" />
          <Circle cx={38} cy={30} r={6.5} fill={colors.accent} />
          <Circle cx={38} cy={30} r={2.4} fill={colors.paper} />
        </Svg>
      )}
      <View style={[styles.badge, { backgroundColor: colors.paper, borderColor: colors.paper3 }]}>
        <Icon name={category?.icon ?? 'alert'} size={10} color={colors.ink} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1.4, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: border.hair,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
