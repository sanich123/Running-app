import { LineChart, ruleTypes } from 'react-native-gifted-charts';

export default function LineChartWrapper({
  metricsArr,
}: {
  metricsArr?: { value: number; labelComponent: () => void }[];
}) {
  const valuesArr = metricsArr?.map(({ value }) => value).filter(Boolean);
  const maxValue = valuesArr?.length ? Math.max(...valuesArr) : 0;

  return (
    <LineChart
      isAnimated
      thickness={3}
      color="#07BAD1"
      maxValue={maxValue}
      noOfSections={3}
      animateOnDataChange
      animationDuration={1000}
      onDataChangeAnimationDuration={300}
      areaChart-
      yAxisTextStyle={{ color: 'lightgray' }}
      data={metricsArr}
      hideDataPoints
      startFillColor={'rgb(84,219,234)'}
      endFillColor={'rgb(84,219,234)'}
      startOpacity={0.4}
      endOpacity={0.1}
      spacing={22}
      backgroundColor="#414141"
      rulesColor="gray"
      rulesType={ruleTypes.SOLID}
      yAxisColor="lightgray"
      xAxisColor="lightgray"
    />
  );
}
