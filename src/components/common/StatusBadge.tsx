import { StyleSheet, View } from 'react-native';

import { border, radius } from '@/constants/design';
import { STATUS_META } from '@/constants/reportMeta';
import { useTheme } from '@/hooks/use-theme';
import { type ReportStatus } from '@/types/report';

import { AppText } from './AppText';
import { Icon } from './Icon';

type Props = {
  status: ReportStatus;
  compact?: boolean;
  /** Drafts and rejected reports stay hollow; nothing is colour-coded. */
  showIcon?: boolean;
};

export function StatusBadge({ status, compact = false, showIcon = true }: Props) {
  const { colors } = useTheme();
  const meta = STATUS_META[status];
  const hollow = status === 'draft' || status === 'rejected';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: hollow ? 'transparent' : colors.paper2,
          borderColor: hollow ? colors.ink3 : colors.paper3,
          borderRadius: radius.pill,
          paddingHorizontal: compact ? 8 : 10,
          paddingVertical: compact ? 3 : 5,
        },
      ]}
    >
      {showIcon ? <Icon name={meta.icon} size={compact ? 11 : 13} color={colors.ink2} /> : null}
      <AppText
        variant="meta"
        color="ink2"
        style={[styles.label, { fontSize: compact ? 9.5 : 10.5 }]}
        numberOfLines={1}
      >
        {meta.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: border.hair,
  },
  label: { letterSpacing: 0.4 },
});
