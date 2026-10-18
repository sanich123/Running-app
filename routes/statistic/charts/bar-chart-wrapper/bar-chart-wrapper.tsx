import { BarChart } from 'react-native-gifted-charts';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { getSteps } from '../util';
import type { BarChartWrapperProps } from '../types';

export default function BarChartWrapper({ metricsArr, year }: BarChartWrapperProps) {
  const { push } = useRouter();
  const { userId } = useAppSelector(({ auth }) => auth);
  const valuesArr = metricsArr?.map(({ value }) => value).filter((value) => value > 0);
  const maxValueFromData = valuesArr?.length ? Math.max(...valuesArr) : 0;
  const { colors } = useTheme();
  const medianValue = valuesArr?.length
    ? Math.round(valuesArr?.reduce((acc, value) => (acc += value), 0) / valuesArr?.length)
    : 0;
  const { steps, maxValue, noOfSections } = getSteps(maxValueFromData);
  const { width } = useWindowDimensions();
  const widthOfScreen = width < MAX_MOBILE_WIDTH ? width : MAX_MOBILE_WIDTH;
  const chartWidth = widthOfScreen - 68;
  const barWidth = Math.max((widthOfScreen - 150) / 12, 10);
  const topLabelWidth = Math.max(barWidth, String(maxValueFromData).length * 8 + 6);
  const hasValues = Boolean(valuesArr?.length);

  return (
    <View style={styles.wrapper}>
      {!hasValues && (
        <Text variant="bodySmall" style={[styles.emptyLabel, { color: colors.onSurfaceVariant }]}>
          Нет данных за этот период
        </Text>
      )}
      <BarChart
        width={chartWidth}
        barWidth={barWidth}
        showReferenceLine1
        referenceLine1Position={hasValues ? medianValue : undefined}
        isAnimated={false}
        referenceLine1Config={{
          color: colors.tertiary,
          thickness: 2,
          labelText: medianValue.toString(),
          dashWidth: 4,
          dashGap: 4,
          labelTextStyle: {
            position: 'absolute',
            right: -24,
            color: colors.tertiary,
            fontSize: 10,
          },
        }}
        onPress={(_: any, index: any) =>
          push(`/${ROUTES.monthStatistics}?userId=${userId}&year=${year}&month=${index}`)
        }
        frontColor={colors.primary}
        gradientColor={colors.primaryContainer}
        showGradient
        barBorderRadius={6}
        roundedTop
        maxValue={maxValue}
        yAxisTextStyle={{ color: colors.onSurfaceVariant, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.onSurfaceVariant, fontSize: 11 }}
        data={metricsArr}
        spacing={6}
        initialSpacing={8}
        endSpacing={0}
        topLabelContainerStyle={{
          width: topLabelWidth,
          left: (barWidth - topLabelWidth) / 2,
        }}
        backgroundColor={colors.surface}
        rulesColor={colors.outlineVariant}
        yAxisColor={colors.outlineVariant}
        xAxisColor={colors.outlineVariant}
        yAxisLabelTexts={steps}
        noOfSections={noOfSections}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', minHeight: 250, paddingTop: 12 },
  emptyLabel: { marginBottom: 6 },
});
