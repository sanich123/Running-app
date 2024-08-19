import { showCrossPlatformToast } from '@U/custom-toast';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import { hasServicesEnabledAsync } from 'expo-location';
import { useEffect} from 'react';
import { Switch, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

export default function LocationSettingsSwitcher({
  isLocationEnabled,
  setIsLocationEnabled,
}: {
  isLocationEnabled: boolean;
  setIsLocationEnabled: (arg: boolean) => void;
}) {
  useEffect(() => {
    async function isLocationServicesEnabled() {
      const isLocationEnabled = await hasServicesEnabledAsync();
      setIsLocationEnabled(isLocationEnabled);
    }
    isLocationServicesEnabled();
  }, [setIsLocationEnabled, isLocationEnabled]);

  return (
    <View style={styles.switcherWrapper}>
      <Text variant="titleSmall">{`${isLocationEnabled ? 'Телефон получает местоположение' : 'Включить местоположение в настройках'}`}</Text>
      <Switch
        value={isLocationEnabled}
        onValueChange={async () => {
          try {
            const request = await startActivityAsync(ActivityAction.LOCATION_SOURCE_SETTINGS);
            if (request) {
              setIsLocationEnabled(!isLocationEnabled);
            }
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
