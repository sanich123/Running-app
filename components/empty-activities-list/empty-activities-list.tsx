import { useAppSelector } from '@R/typed-hooks';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { EMPTY_ACTIVITIES_LIST } from './const';

export default function EmptyActivitiesList() {
  const { language } = useAppSelector(({ language }) => language);
  return (
    <View style={{ alignItems: 'center' }}>
      <Text variant="titleLarge">{EMPTY_ACTIVITIES_LIST[language].emptyActivities}</Text>
    </View>
  );
}
