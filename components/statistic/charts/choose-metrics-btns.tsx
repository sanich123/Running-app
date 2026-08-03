import { SegmentedButtons } from 'react-native-paper';
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
  const { language } = useAppSelector(({ language }) => language);
  return (
    <SegmentedButtons
      style={{ marginTop: 20, marginHorizontal: 10 }}
      buttons={getMetricsBtnsValues(language)}
      value={chartValue}
      onValueChange={(value) => setChartValue(value as ChooseMetricsBtnsValues)}
      density="small"
    />
  );
}
