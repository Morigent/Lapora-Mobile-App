import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Icon } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { border, radius, space } from '@/constants/design';
import { HAZARD_META, REPORT_CATEGORIES } from '@/constants/reportMeta';
import { useTheme } from '@/hooks/use-theme';
import { type HazardLevel, type ReportCategoryId } from '@/types/report';

export function CategoryPicker({
  value,
  onChange,
  error,
}: {
  value: ReportCategoryId | null;
  onChange: (value: ReportCategoryId) => void;
  error?: string | null;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <AppText variant="label" color="ink3">
        KATEGORI KERUSAKAN
      </AppText>
      <View style={styles.grid}>
        {REPORT_CATEGORIES.map((category) => {
          const selected = category.id === value;
          return (
            <PressableScale
              key={category.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={category.label}
              onPress={() => onChange(category.id)}
              style={styles.cell}
            >
              <View
                style={[
                  styles.tile,
                  {
                    borderColor: selected ? colors.ink : colors.paper3,
                    backgroundColor: selected ? colors.ink : colors.paper,
                    borderWidth: selected ? border.heavy : 1.4,
                  },
                ]}
              >
                <Icon name={category.icon} size={18} color={selected ? colors.paper : colors.ink} />
                <AppText
                  variant="meta"
                  color={selected ? 'paper' : 'ink2'}
                  align="center"
                  style={styles.tileLabel}
                  numberOfLines={2}
                >
                  {category.label}
                </AppText>
              </View>
            </PressableScale>
          );
        })}
      </View>
      {error ? (
        <AppText variant="bodySmall" color="accent">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

export function SeverityPicker({
  value,
  onChange,
}: {
  value: HazardLevel;
  onChange: (value: HazardLevel) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <AppText variant="label" color="ink3">
        TINGKAT BAHAYA
      </AppText>
      <View style={styles.severityRow}>
        {(Object.keys(HAZARD_META) as HazardLevel[]).map((level) => {
          const selected = level === value;
          return (
            <PressableScale
              key={level}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(level)}
              style={styles.severityCell}
            >
              <View style={[styles.severity, { borderColor: selected ? colors.ink : colors.paper3 }]}>
                <View style={styles.dots}>
                  {[0, 1, 2].map((index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            index < HAZARD_META[level].dots
                              ? selected
                                ? colors.accent
                                : colors.ink
                              : colors.paper3,
                        },
                      ]}
                    />
                  ))}
                </View>
                <AppText variant="bodySmall" weight={selected ? '600' : '400'} color={selected ? 'ink' : 'ink2'}>
                  {HAZARD_META[level].label}
                </AppText>
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

export function LockedEvidenceNote({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <AppCard padding={12} shadow={false} background={colors.paper2}>
      <AppText variant="bodySmall" color="ink2">
        {children}
      </AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  field: { gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cell: { width: '31.5%' },
  tile: { borderRadius: radius.tile, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center', gap: 5, minHeight: 62 },
  tileLabel: { fontSize: 9.5, lineHeight: 12 },
  severityRow: { flexDirection: 'row', gap: space.sm },
  severityCell: { flex: 1 },
  severity: {
    borderWidth: 1.4,
    borderRadius: radius.tile,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 6,
  },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
