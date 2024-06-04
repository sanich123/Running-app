import { useAppSelector } from '@R/typed-hooks';
import useGetCurrentLocation from '@U/hooks/use-get-current-location';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { ACTIVITY_LOCATION_INDICATOR } from './const';

export default function LocationIndicator() {
  const { isLoading, isError, isSuccess } = useGetCurrentLocation();
  const { language } = useAppSelector(({ language }) => language);
  const isNeedToShowIndicator = isLoading || isError || isSuccess;
  return (
    <>
      {isNeedToShowIndicator && (
        <View style={[styles.layout, { backgroundColor: !isSuccess ? 'yellow' : 'green' }]}>
          <Text variant="bodyLarge" style={{ color: 'white' }}>
            {isLoading && ACTIVITY_LOCATION_INDICATOR[language].isLoading}
            {isError && ACTIVITY_LOCATION_INDICATOR[language].isError}
            {isSuccess && ACTIVITY_LOCATION_INDICATOR[language].isSuccess}
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 10,
    height: 25,
    width: '100%',
  },
});
