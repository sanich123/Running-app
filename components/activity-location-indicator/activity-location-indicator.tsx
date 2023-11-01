import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import useGetCurrentLocation from '../../utils/hooks/use-get-current-location';
import { View } from '../Themed';

export default function ActivityLocationIndicator() {
  const { isLoading, isError, isSuccess } = useGetCurrentLocation();

  return (
    <>
      {isLoading ? (
        <View style={[styles.indicatorLayout, { backgroundColor: 'yellow' }]}>
          <Text variant="bodyLarge">Getting your position...</Text>
        </View>
      ) : null}
      {isError ? (
        <View style={[styles.indicatorLayout, { backgroundColor: 'green' }]}>
          <Text variant="bodyLarge" style={[styles.indicatorLayout, { backgroundColor: 'green' }]}>
            An error occured
          </Text>
        </View>
      ) : null}
      {isSuccess ? (
        <View style={[styles.indicatorLayout, { backgroundColor: 'green' }]}>
          <Text variant="bodyLarge">Have got your position!</Text>
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
    height: 30,
  },
});
