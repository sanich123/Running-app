import { useAppSelector } from '@R/typed-hooks';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
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
  const { language } = useAppSelector(({ language }) => language);
  return (
    <View style={{ display: 'flex', width: '33%', alignItems: 'center' }}>
      <Text variant="bodySmall">{title}</Text>
      <Text variant="headlineSmall">
        {isLoading && ' '}
        {isSuccess && metrics}
        {isError && WEEK_STATISTICS[language].error}
      </Text>
    </View>
  );
}
