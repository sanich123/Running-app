import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Text, useTheme } from 'react-native-paper';
import { getSteps } from './util';
import { Href, useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import { useAuth } from '@A/context/auth-context';
import { BarChartWrapperProps } from './types';
import { useWindowDimensions } from 'react-native';
import { MAX_MOBILE_WIDTH } from '@const/const';

export default function BarChartWrapper({ metricsArr, year, title }: BarChartWrapperProps) {
  const { push } = useRouter();
  const { user } = useAuth();
  const valuesArr = metricsArr?.map(({ value }) => value).filter(Boolean);
  const maxValueFromData = valuesArr?.length ? Math.max(...valuesArr) : 0;
  const { colors } = useTheme();
  const medianValue = valuesArr?.length
    ? Math.round(valuesArr?.reduce((acc, value) => (acc += value), 0) / valuesArr?.length)
    : 0;
  const { steps, maxValue, noOfSections } = getSteps(maxValueFromData);
  const { width } = useWindowDimensions();
  const widthOfScreen = width < MAX_MOBILE_WIDTH ? width : MAX_MOBILE_WIDTH;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="headlineSmall" style={{ marginVertical: 15 }}>
        {title}
      </Text>
      <BarChart
        width={widthOfScreen - 60}
        barWidth={(widthOfScreen - 90) / 12}
        showReferenceLine1
        referenceLine1Position={medianValue}
        isAnimated
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
        onPress={(_: any, index: any) =>
          push(`/${ROUTES.statistic}/${ROUTES.monthStatistic}?userId=${user?.id}&year=${year}&month=${index}` as Href)
        }
        frontColor={colors.primary}
        maxValue={maxValue}
        areaChart-
        yAxisTextStyle={{ color: colors.onBackground }}
        xAxisLabelTextStyle={{ color: colors.onBackground }}
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
