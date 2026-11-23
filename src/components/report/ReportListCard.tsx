import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ReportThumb } from '@/components/report/ReportThumb';
import { space } from '@/constants/design';
import { type Report } from '@/types/report';
import { formatRelative } from '@/utils/date';
import { formatDistance } from '@/utils/geo';

export function ReportListCard({
  report,
  distanceM,
  onPress,
}: {
  report: Report;
  distanceM: number | null;
  onPress: () => void;
}) {
  const meta = [report.address ?? 'Lokasi tidak diberi nama'];
  if (distanceM != null) meta.push(formatDistance(distanceM));
  meta.push(formatRelative(report.capturedAt));

  return (
    <AppCard onPress={onPress} padding={12} accessibilityLabel={`${report.title}, ${report.address ?? ''}`}>
      <View style={styles.row}>
        <ReportThumb report={report} size={66} />
        <View style={styles.body}>
          <AppText variant="h3" numberOfLines={2}>
            {report.title}
          </AppText>
          <AppText variant="bodySmall" color="ink3" numberOfLines={2}>
            {meta.join(' · ')}
          </AppText>
          <StatusBadge status={report.status} compact />
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  body: { flex: 1, gap: 4 },
});
