import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { Icon } from '@/components/common/Icon';
import { STATUS_META } from '@/constants/reportMeta';
import { space } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { type ReportStatus } from '@/types/report';
import { formatShortStamp } from '@/utils/date';

export type StatusEvent = { id: string; status: ReportStatus; at: string; note?: string };

export function StatusTimeline({ events }: { events: StatusEvent[] }) {
  const { colors } = useTheme();
  if (events.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {events.map((event, index) => {
        const meta = STATUS_META[event.status];
        const last = index === events.length - 1;
        return (
          <View key={event.id} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  {
                    borderColor: last ? colors.accent : colors.ink,
                    backgroundColor: last ? colors.accent : colors.paper,
                  },
                ]}
              >
                <Icon name={meta.icon} size={9} color={last ? colors.paper : colors.ink} />
              </View>
              {!last ? <View style={[styles.line, { borderColor: colors.paper3 }]} /> : null}
            </View>
            <View style={styles.body}>
              <AppText variant="bodySmall" weight="600">
                {meta.label}
              </AppText>
              <AppText variant="meta" color="ink3">
                {formatShortStamp(event.at)}
                {event.note ? ` · ${event.note}` : ''}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 0 },
  row: { flexDirection: 'row', gap: space.sm },
  rail: { width: 20, alignItems: 'center' },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { flex: 1, borderLeftWidth: 1.4, borderStyle: 'dashed', marginVertical: 2 },
  body: { flex: 1, paddingBottom: space.md, gap: 1 },
});
