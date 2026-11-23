import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { Icon } from '@/components/common/Icon';
import { border, radius, space } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { type CaptureSession } from '@/types/report';
import { formatCoordinates, formatShortStamp, formatTime } from '@/utils/date';
import { formatAccuracy } from '@/utils/geo';

/** Screen 06/09/14 evidence frame: photo + locked watermark strip. */
export function PhotoEvidence({ session, height = 232 }: { session: CaptureSession; height?: number }) {
  const { colors } = useTheme();
  const { point, accuracyM, locationMeasuredAt } = session.metadata;

  return (
    <View style={[styles.frame, { borderColor: colors.ink, backgroundColor: colors.paper2 }]}>
      <Image source={{ uri: session.photoUri }} style={[styles.photo, { height }]} resizeMode="cover" />
      <View style={[styles.strip, { backgroundColor: 'rgba(17,17,17,0.82)' }]}>
        <View style={styles.stripLeft}>
          <View style={styles.lockRow}>
            <Icon name="lock" size={11} color={colors.paper} />
            <AppText variant="meta" color="paper" style={styles.lockText}>
              BUKTI · TERKUNCI
            </AppText>
          </View>
          <AppText variant="bodySmall" color="paper" style={styles.coords}>
            {formatCoordinates(point.latitude, point.longitude)}
          </AppText>
          <AppText variant="meta" color="paper2">
            {formatShortStamp(locationMeasuredAt)} · akurasi {formatAccuracy(accuracyM)}
          </AppText>
        </View>
        <View style={[styles.accChip, { borderColor: colors.paper }]}>
          <AppText variant="meta" color="paper">
            {formatAccuracy(accuracyM)}
          </AppText>
        </View>
      </View>
      <View style={[styles.timeChip, { backgroundColor: colors.paper, borderColor: colors.ink }]}>
        <Icon name="clock" size={10} color={colors.ink} />
        <AppText variant="meta" color="ink" style={styles.timeText}>
          {formatTime(locationMeasuredAt)}
        </AppText>
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: space.md,
    gap: space.sm,
  },
  stripLeft: { gap: 2, flex: 1 },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lockText: { fontSize: 9, letterSpacing: 1 },
  coords: { letterSpacing: 0.4 },
  accChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  timeChip: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.2,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timeText: { fontSize: 9.5 },
});
