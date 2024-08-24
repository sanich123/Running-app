import { showCrossPlatformToast } from '@U/custom-toast';
import { LocationPermissionResponse } from 'expo-location';
import { View, StyleSheet } from 'react-native';
import { Switch, Text } from 'react-native-paper';

export default function ForegroundLocationSwitcher({
  foregroundPermissionStatus,
  requestForegroundPermission,
}: {
  foregroundPermissionStatus: LocationPermissionResponse;
  requestForegroundPermission: () => Promise<LocationPermissionResponse>;
}) {
  return (
    <View style={styles.switcherWrapper}>
      <Text variant="titleSmall">{`${foregroundPermissionStatus ? 'Отслеживание местоположения' : 'Включить отслеживание местоположения'}`}</Text>
      <Switch
        value={foregroundPermissionStatus.granted}
        onValueChange={async () => {
          try {
            await requestForegroundPermission();
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
