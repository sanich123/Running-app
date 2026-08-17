import { ScrollView, StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { getMetricsBtnsValues } from './const';
import type { ChooseMetricsBtnsValues } from './types';

export default function ChooseMetricsBtns({
  chartValue,
  setChartValue,
}: {
  chartValue: ChooseMetricsBtnsValues;
  setChartValue: (arg: ChooseMetricsBtnsValues) => void;
}) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const buttons = getMetricsBtnsValues(language);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.container}>
      {buttons.map((button, index) => (
        <Chip
          key={button.value}
          compact
          mode="outlined"
          selected={button.value === chartValue}
          showSelectedOverlay
          selectedColor={colors.onPrimaryContainer}
          style={[styles.chip, { borderColor: colors.outlineVariant, marginLeft: index ? 8 : 0 }]}
          textStyle={styles.text}
          onPress={() => setChartValue(button.value as ChooseMetricsBtnsValues)}>
          {button.label}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16 },
  content: { paddingHorizontal: 14 },
  chip: { borderRadius: 10 },
  text: { fontSize: 13, fontWeight: '700' },
});
