import { useAppSelector } from '@R/typed-hooks';
import useGetCurrentLocation from '@U/hooks/use-get-current-location';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { ACTIVITY_LOCATION_INDICATOR } from './const';

export default function ActivityLocationIndicator() {
  const { isLoading, isError, isSuccess } = useGetCurrentLocation();
  const { language } = useAppSelector(({ language }) => language);
  return (
    <>
      {isLoading ? (
        <View style={[styles.indicatorLayout, { backgroundColor: 'yellow' }]}>
          <Text variant="bodyLarge">{ACTIVITY_LOCATION_INDICATOR[language].isLoading}</Text>
        </View>
      ) : null}
      {isError ? (
        <View style={[styles.indicatorLayout, { backgroundColor: 'green' }]}>
          <Text variant="bodyLarge" style={[styles.indicatorLayout, { backgroundColor: 'green' }]}>
            {ACTIVITY_LOCATION_INDICATOR[language].isError}
          </Text>
        </View>
      ) : null}
      {isSuccess ? (
        <View style={[styles.indicatorLayout, { backgroundColor: 'green' }]}>
          <Text variant="bodyLarge">{ACTIVITY_LOCATION_INDICATOR[language].isSuccess}</Text>
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
