import { useAppSelector } from '@R/typed-hooks';
import { View, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';

import { EMPTY_ACTIVITIES_LIST } from './const';

export default function EmptyActivitiesList() {
  const height = Dimensions.get('window').height;
  const { language } = useAppSelector(({ language }) => language);
  return (
    <View style={{ height: height - 110, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="titleLarge">{EMPTY_ACTIVITIES_LIST[language].emptyActivities}</Text>
    </View>
  );
}
