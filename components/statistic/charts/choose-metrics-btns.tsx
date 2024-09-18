import { SegmentedButtons } from 'react-native-paper';
import { ChooseMetricsBtnsValues } from './types';
import { getMetricsBtnsValues } from './const';
import { useAppSelector } from '@R/typed-hooks';

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
