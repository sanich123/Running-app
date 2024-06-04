import { TIMEOUT_MESSAGE } from '@C/activity/location-indicator/const';
import { setIsAppShuted } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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
    <View style={styles.errorMsg}>
      {isAppShutedByPhone && <Text variant="bodyLarge">{ACTIVITY_ERROR_MSG[language].errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  errorMsg: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: 'orange',
  },
});
