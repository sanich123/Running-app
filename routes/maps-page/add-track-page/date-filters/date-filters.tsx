import { useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Icon, Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';
import type { ActivityDateFilters } from '../utils';
import type { DateFiltersProps } from './types';

export default function DateFilters({ filters, availableFilters, copy, locale, onChange }: DateFiltersProps) {
  const { colors } = useTheme();
  const [openFilter, setOpenFilter] = useState<keyof ActivityDateFilters | null>(null);
  const monthLabel = `${copy.filterMonth}: ${
    filters.month === null
      ? copy.filterAll
      : new Date(2020, filters.month - 1, 1).toLocaleDateString(locale, { month: 'short' })
  }`;
  const dayLabel = `${copy.filterDay}: ${filters.day === null ? copy.filterAll : filters.day}`;
  const yearLabel = `${copy.filterYear}: ${filters.year === null ? copy.filterAll : filters.year}`;
  const menus: {
    key: keyof ActivityDateFilters;
    label: string;
    options: { title: string; value: number | null }[];
  }[] = [
    {
      key: 'month',
      label: monthLabel,
      options: [
        { title: copy.allMonths, value: null },
        ...availableFilters.months.map((month) => ({
          title: new Date(2020, month - 1, 1).toLocaleDateString(locale, { month: 'long' }),
          value: month,
        })),
      ],
    },
    {
      key: 'day',
      label: dayLabel,
      options: [
        { title: copy.allDays, value: null },
        ...availableFilters.days.map((day) => ({ title: String(day), value: day })),
      ],
    },
    {
      key: 'year',
      label: yearLabel,
      options: [
        { title: copy.allYears, value: null },
        ...availableFilters.years.map((year) => ({ title: String(year), value: year })),
      ],
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={styles.filterScroll}
      contentContainerStyle={styles.filterRow}>
      {menus.map(({ key, label, options }) => (
        <Menu
          key={key}
          visible={openFilter === key}
          onDismiss={() => setOpenFilter(null)}
          elevation={3}
          contentStyle={[styles.filterMenuSurface, { backgroundColor: colors.surface }]}
          anchor={
            <TouchableRipple
              accessibilityLabel={label}
              accessibilityRole="button"
              borderless={false}
              hitSlop={0}
              onPress={() => setOpenFilter(key)}
              rippleColor={colors.primaryContainer}
              style={[styles.filterTrigger, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
              testID={`${key}-filter`}>
              <View style={styles.filterTriggerContent}>
                <Text variant="labelLarge" numberOfLines={1} style={[styles.filterLabel, { color: colors.primary }]}>
                  {label}
                </Text>
                {Platform.OS === 'ios' ? (
                  <SymbolView name="chevron.down" size={18} tintColor={colors.onSurfaceVariant} />
                ) : (
                  <Icon source="chevron-down" size={18} color={colors.onSurfaceVariant} />
                )}
              </View>
            </TouchableRipple>
          }>
          {options.map(({ title, value }) => (
            <Menu.Item
              key={`${key}-${value ?? 'all'}`}
              title={title}
              dense
              style={styles.filterMenuItem}
              titleStyle={styles.filterMenuItemTitle}
              onPress={() => {
                onChange(key, value);
                setOpenFilter(null);
              }}
            />
          ))}
        </Menu>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterScroll: { flexGrow: 0, flexShrink: 0, height: 42 },
  filterRow: { alignItems: 'center', flexDirection: 'row', gap: 6, paddingHorizontal: 2, paddingVertical: 2 },
  filterMenuSurface: { borderRadius: 16, minWidth: 176, paddingVertical: 4 },
  filterMenuItem: { minHeight: 32 },
  filterMenuItemTitle: { fontSize: 16, lineHeight: 20 },
  filterTrigger: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  filterTriggerContent: { alignItems: 'center', flexDirection: 'row', gap: 4, minHeight: 38, paddingHorizontal: 10 },
  filterLabel: { fontSize: 13, lineHeight: 18 },
});
