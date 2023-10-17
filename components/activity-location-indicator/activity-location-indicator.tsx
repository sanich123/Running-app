import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import useGetCurrentLocation from '../../utils/hooks/use-get-current-location';

export default function ActivityLocationIndicator() {
  const { isLoading, isError, isSuccess } = useGetCurrentLocation();
  return (
    <>
      {isLoading ? (
        <Text variant="bodyLarge" style={[styles.indicatorLayout, { backgroundColor: 'yellow' }]}>
          Загружаем данные о местоположении...
        </Text>
      ) : null}
      {isError ? (
        <Text variant="bodyLarge" style={[styles.indicatorLayout, { backgroundColor: 'green' }]}>
          An error occured
        </Text>
      ) : null}
      {isSuccess ? (
        <Text variant="bodyLarge" style={[styles.indicatorLayout, { backgroundColor: 'green' }]}>
          Получили данные о местоположении!
        </Text>
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
