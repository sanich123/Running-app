import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { ACTIVITY } from '../../constants/texts/activity';
import { setIsAppShuted } from '../../redux/location/location';

export default function ActivityErrorMsg() {
  const dispatch = useDispatch();
  const { isAppShutedByPhone } = useSelector(({ location }) => location);

  useEffect(() => {
    if (isAppShutedByPhone) {
      setTimeout(() => dispatch(setIsAppShuted(false)), 10000);
    }
  }, [isAppShutedByPhone]);

  return (
    <>
      {isAppShutedByPhone ? (
        <View style={[styles.indicatorLayout, { backgroundColor: 'orange' }]}>
          <Text variant="bodyLarge">{ACTIVITY.english.ERROR_MSG}</Text>
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
