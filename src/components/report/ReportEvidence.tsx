import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { Icon } from '@/components/common/Icon';
import { border, radius, space } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { type Report } from '@/types/report';
import { formatCoordinates, formatShortStamp } from '@/utils/date';
import { formatAccuracy } from '@/utils/geo';

/** Design screen 14 — the stored evidence with its locked metadata strip. */
export function ReportEvidence({ report, height = 224 }: { report: Report; height?: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.frame, { borderColor: colors.ink, backgroundColor: colors.paper2 }]}>
      <Image source={{ uri: report.photoPath }} style={[styles.photo, { height }]} resizeMode="cover" />
      <View style={styles.strip}>
        <View style={styles.left}>
          <View style={styles.lockRow}>
            <Icon name="lock" size={10} color={colors.paper} />
            <AppText variant="meta" color="paper" style={styles.lockText}>
              METADATA TERKUNCI
            </AppText>
          </View>
          <AppText variant="bodySmall" color="paper">
            {formatCoordinates(report.point.latitude, report.point.longitude)}
          </AppText>
          <AppText variant="meta" color="paper2">
            {formatShortStamp(report.locationMeasuredAt)} · {formatAccuracy(report.accuracyM)}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderWidth: border.heavy, borderRadius: radius.card, overflow: 'hidden' },
  photo: { width: '100%' },
  strip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: space.md,
    backgroundColor: 'rgba(17,17,17,0.82)',
  },
  left: { gap: 2 },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lockText: { fontSize: 9, letterSpacing: 1 },
});
