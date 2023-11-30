import { useAppSelector } from '@R/typed-hooks';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { NETWORK_INDICATOR } from './const';

export default function NetworkIndicator() {
  const {
    networkState: { isInternetReachable },
  } = useAppSelector(({ network }) => network);
  const { language } = useAppSelector(({ language }) => language);

  return (
    <View style={[styles.indicatorLayout, isInternetReachable && { display: 'none' }]}>
      <Text variant="bodyLarge">{!isInternetReachable && NETWORK_INDICATOR[language].offline}</Text>
    </View>
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
    zIndex: 5,
    backgroundColor: 'yellow',
  },
});
