import { SegmentedButtons } from 'react-native-paper';
import { ChooseMetricsBtnsValues } from './types';
import { METRICS_BTNS_VALUES } from './const';

export default function ChooseMetricsBtns({
  chartValue,
  setChartValue,
}: {
  chartValue: ChooseMetricsBtnsValues;
  setChartValue: (arg: ChooseMetricsBtnsValues) => void;
}) {
  return (
    <SegmentedButtons
      style={{ marginTop: 20, marginHorizontal: 10 }}
      buttons={METRICS_BTNS_VALUES}
      value={chartValue}
      onValueChange={(value) => setChartValue(value as ChooseMetricsBtnsValues)}
      density="small"
    />
  );
}
