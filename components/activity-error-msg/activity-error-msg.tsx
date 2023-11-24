import { TIMEOUT_MESSAGE } from '@C/activity-location-indicator/const';
import { setIsAppShuted } from '@R/location/location';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { ACTIVITY_ERROR_MSG } from './const';

export default function ActivityErrorMsg() {
  const dispatch = useDispatch();
  const { isAppShutedByPhone } = useSelector(({ location }) => location);
  const { language } = useSelector(({ language }) => language);

  useEffect(() => {
    if (isAppShutedByPhone) {
      setTimeout(() => dispatch(setIsAppShuted(false)), TIMEOUT_MESSAGE);
    }
  }, [isAppShutedByPhone]);

  return (
    <>
      {isAppShutedByPhone ? (
        <View style={[styles.indicatorLayout, { backgroundColor: 'orange' }]}>
          <Text variant="bodyLarge">{ACTIVITY_ERROR_MSG[language as keyof typeof ACTIVITY_ERROR_MSG].errorMsg}</Text>
        </View>
      ) : null}
    </>
  );
}

export const styles = StyleSheet.create({
  indicatorLayout: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 100,
    paddingLeft: 5,
    paddingRight: 5,
  },
});
