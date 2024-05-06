import { useAppSelector } from '@R/typed-hooks';
import useGetCurrentLocation from '@U/hooks/use-get-current-location';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { ACTIVITY_LOCATION_INDICATOR } from './const';

export default function ActivityLocationIndicator() {
  const { isLoading, isError, isSuccess } = useGetCurrentLocation();
  const { language } = useAppSelector(({ language }) => language);
  const isNeedToShowIndicator = isLoading || isError || isSuccess;
  return (
    <>
      {isNeedToShowIndicator && (
        <View
          className={`flex align-center items-center absolute top-0 w-full h-8 z-10 ${!isSuccess ? 'bg-yellow-300' : 'bg-green-500'}`}>
          <Text variant="bodyLarge">
            {isLoading && ACTIVITY_LOCATION_INDICATOR[language].isLoading}
            {isError && ACTIVITY_LOCATION_INDICATOR[language].isError}
            {isSuccess && ACTIVITY_LOCATION_INDICATOR[language].isSuccess}
          </Text>
        </View>
      )}
    </>
  );
}
