import { View, StyleSheet } from 'react-native';

import { showCrossPlatformToast } from '@U/custom-toast';
import { LocationPermissionResponse } from 'expo-location';
import { Switch, Text } from 'react-native-paper';

export default function BackgroundLocationSwitcher({
  backgroundPermissionStatus,
  requestBackgroundPermission,
}: {
  backgroundPermissionStatus: boolean;
  requestBackgroundPermission: () => Promise<LocationPermissionResponse>;
}) {
  return (
    <View style={styles.switcherWrapper}>
      <Text variant="titleSmall">{`${backgroundPermissionStatus ? 'Отслеживание местоположения в фоне' : 'Включить отслеживание местоположения в фоне'}`}</Text>
      <Switch
        value={backgroundPermissionStatus}
        onValueChange={async () => {
          try {
            await requestBackgroundPermission();
          } catch (error) {
            showCrossPlatformToast(JSON.stringify(error));
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  switcherWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
});
