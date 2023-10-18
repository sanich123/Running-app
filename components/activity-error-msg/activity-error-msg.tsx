import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { setIsAppShuted } from '../../redux/location/location';

export default function ActivityErrorMsg() {
  const { isAppShutedByPhone } = useSelector(({ location }) => location);

  const dispatch = useDispatch();
  useEffect(() => {
    if (isAppShutedByPhone) {
      setTimeout(() => dispatch(setIsAppShuted(false)), 10000);
    }
  }, [isAppShutedByPhone]);

  return (
    <>
      {isAppShutedByPhone ? (
        <View style={[styles.indicatorLayout, { backgroundColor: 'orange' }]}>
          <Text variant="bodyLarge">
            Your phone (or, maybe, you) shuted our app in the background. Don't worry, we do our best to recover state
            of your activity. Note, that activity is paused, so you have to continue manually
          </Text>
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
    height: 110,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
  },
});
