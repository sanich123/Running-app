import { TIMEOUT_MESSAGE } from '@C/activity/location-indicator/const';
import { setIsAppShuted } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { ACTIVITY_ERROR_MSG } from './const';

export default function ErrorMsg() {
  const dispatch = useAppDispatch();
  const { isAppShutedByPhone } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ language }) => language);

  useEffect(() => {
    if (isAppShutedByPhone) {
      setTimeout(() => dispatch(setIsAppShuted(false)), TIMEOUT_MESSAGE);
    }
  }, [isAppShutedByPhone]);

  return (
    <>
      {isAppShutedByPhone ? (
        <View className="flex items-center justify-center absolute top-0 w-full h-28 p-x-5 bg-orange-200">
          <Text variant="bodyLarge">{ACTIVITY_ERROR_MSG[language].errorMsg}</Text>
        </View>
      ) : null}
    </>
  );
}
