import { NetInfoCellularGeneration } from '@react-native-community/netinfo';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { NETWORK_INDICATOR } from './const';

export default function NetworkIndicator() {
  const {
    networkState: { type, isInternetReachable, details },
  } = useSelector(({ network }) => network);
  const { language } = useSelector(({ language }) => language);
  const isSlowNetwork =
    details?.cellularGeneration === NetInfoCellularGeneration['3g'] ||
    details?.cellularGeneration === NetInfoCellularGeneration['2g'];

  return (
    <View
      style={[
        styles.indicatorLayout,
        { backgroundColor: 'yellow' },
        isInternetReachable && !isSlowNetwork && { display: 'none' },
      ]}>
      <Text variant="bodyLarge">
        {!isInternetReachable && NETWORK_INDICATOR[language].offline}
        {isSlowNetwork && `${NETWORK_INDICATOR[language].slowNetwork}, ${NETWORK_INDICATOR[language].type}: ${type}`}
      </Text>
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
  },
});
