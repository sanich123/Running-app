import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { EMPTY_ACTIVITIES_LIST } from './const';

export default function EmptyActivitiesList() {
  const { language } = useSelector(({ language }) => language);
  return (
    <View>
      <Text variant="titleLarge">
        {EMPTY_ACTIVITIES_LIST[language as keyof typeof EMPTY_ACTIVITIES_LIST].emptyActivities}
      </Text>
    </View>
  );
}
