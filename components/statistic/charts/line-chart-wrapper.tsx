import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Text, useTheme } from 'react-native-paper';

export default function LineChartWrapper({
  metricsArr,
  year,
  type,
}: {
  metricsArr?: { value: number; label: string }[];
  year: number;
  type: string;
}) {
  const valuesArr = metricsArr?.map(({ value }) => value).filter(Boolean);
  const maxValue = valuesArr?.length ? Math.max(...valuesArr) : 0;
  const { colors } = useTheme();
  const medianValue = valuesArr?.length
    ? Math.round(valuesArr?.reduce((acc, value) => (acc += value), 0) / valuesArr?.length)
    : 0;
  // console.log(metricsArr);
  return (
    <View style={{ marginVertical: 50, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="bodyLarge" style={{ marginVertical: 20 }}>
        Какой-то заголово
      </Text>
      <BarChart
        yAxisLabelSuffix=" km"
        yAxisLabelWidth={50}
        barWidth={25}
        showReferenceLine1
        referenceLine1Position={medianValue}
        referenceLine1Config={{
          color: 'gray',
          dashWidth: 2,
          dashGap: 3,
          thickness: 5,
        }}
        // labelWidth={50}
        onPress={(items: any, index: any) => console.log(year, type, index)}
        roundedTop
        isAnimated
        frontColor={colors.primary}
        maxValue={maxValue}
        noOfSections={3}
        animationDuration={500}
        areaChart-
        yAxisTextStyle={{ color: colors.onBackground }}
        data={metricsArr}
        spacing={2}
        backgroundColor={colors.background}
        rulesColor={colors.onBackground}
        yAxisColor={colors.onBackground}
        xAxisColor={colors.onBackground}
        // renderTooltip={(item, index) => {
        //   return (
        //     <View
        //       style={{
        //         marginBottom: 20,
        //         marginLeft: -6,
        //         backgroundColor: '#ffcefe',
        //         paddingHorizontal: 6,
        //         paddingVertical: 4,
        //         borderRadius: 4,
        //       }}>
        //       <Text>Подсказка</Text>
        //     </View>
        //   );
        // }}
      />
    </View>
  );
}
