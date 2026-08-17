import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { WEEK_STATISTICS } from './const';

export default function WeekStatisticsMetric({
  isError,
  isSuccess,
  isLoading,
  metrics,
  title,
}: {
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  metrics: string;
  title: string;
}) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  return (
    <View style={{ display: 'flex', width: '33%', alignItems: 'center', minWidth: 0 }}>
      <Text variant="bodySmall" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ fontSize: 11 }}>
        {title}
      </Text>
      <Text
        variant="titleLarge"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={{
          color: colors.primary,
          fontFamily: FONT_FAMILIES.extraBold,
          fontSize: 24,
          lineHeight: 30,
        }}>
        {isLoading && ' '}
        {isSuccess && metrics}
        {isError && WEEK_STATISTICS[language].error}
      </Text>
    </View>
  );
}
