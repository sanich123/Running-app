import { ScrollView, StyleSheet } from 'react-native';
import DateFilterMenu from './date-filter-menu/date-filter-menu';
import type { ActivityDateFilters } from '../utils';
import type { DateFiltersProps } from './types';

export default function DateFilters({ filters, availableFilters, copy, locale, onChange }: DateFiltersProps) {
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
        <DateFilterMenu
          key={key}
          triggerLabel={label}
          accessibilityLabel={label}
          testID={`${key}-filter`}
          options={options.map(({ title, value }) => ({ label: title, value }))}
          selectedValue={filters[key]}
          onSelect={(value) => onChange(key, value)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterScroll: { flexGrow: 0, flexShrink: 0, height: 42 },
  filterRow: { alignItems: 'center', flexDirection: 'row', gap: 6, paddingHorizontal: 2, paddingVertical: 2 },
});
