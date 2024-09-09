import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Text, useTheme } from 'react-native-paper';
import { getSteps } from './util';

export default function BarChartWrapper({
  metricsArr,
  year,
  type,
  title,
}: {
  metricsArr?: { value: number; label: string }[];
  year: number;
  type: string;
  title: string;
}) {
  const valuesArr = metricsArr?.map(({ value }) => value).filter(Boolean);
  const maxValueFromData = valuesArr?.length ? Math.max(...valuesArr) : 0;
  const { colors } = useTheme();
  const medianValue = valuesArr?.length
    ? Math.round(valuesArr?.reduce((acc, value) => (acc += value), 0) / valuesArr?.length)
    : 0;

  const { steps, maxValue, noOfSections } = getSteps(maxValueFromData);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="bodyLarge" style={{ marginVertical: 8 }}>
        {title}
      </Text>
      <BarChart
        barWidth={25}
        showReferenceLine1
        referenceLine1Position={medianValue}
        referenceLine1Config={{
          color: 'orange',
          thickness: 2,
          labelText: medianValue.toString(),
          dashWidth: 2,
          dashGap: 1,
          labelTextStyle: {
            position: 'absolute',
            right: -20,
            color: 'orange',
          },
        }}
        onPress={(items: any, index: any) => console.log(year, type, index)}
        // isAnimated
        frontColor={colors.primary}
        maxValue={maxValue}
        // animationDuration={500}
        areaChart-
        yAxisTextStyle={{ color: colors.onBackground }}
        data={metricsArr}
        spacing={2}
        backgroundColor={colors.background}
        rulesColor={colors.onBackground}
        yAxisColor={colors.onBackground}
        xAxisColor={colors.onBackground}
        yAxisLabelTexts={steps}
        noOfSections={noOfSections}
      />
    </View>
  );
}
