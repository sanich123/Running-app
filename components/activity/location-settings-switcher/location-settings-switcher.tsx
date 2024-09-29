import { showCrossPlatformToast } from '@U/custom-toast';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import { hasServicesEnabledAsync } from 'expo-location';
import { useEffect, useState } from 'react';
import { Switch, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';
import { LocationSettingsSwitcherProps } from '../types';

export default function LocationSettingsSwitcher({
  isLocationEnabled,
  setIsLocationEnabled,
}: LocationSettingsSwitcherProps) {
  const [isNeedToRefreshPermission, setIsNeedToRefreshPermission] = useState(false);
  const { language } = useAppSelector(({ language }) => language);
  useEffect(() => {
    async function isLocationServicesEnabled() {
      const isLocationEnabled = await hasServicesEnabledAsync();
      setIsLocationEnabled(isLocationEnabled);
    }
    if (!isLocationEnabled || isNeedToRefreshPermission) {
      isLocationServicesEnabled();
      setIsNeedToRefreshPermission(false);
    }
  }, [setIsLocationEnabled, isLocationEnabled, isNeedToRefreshPermission]);

  return (
    <View style={styles.switcherWrapper}>
      <Text variant="titleSmall">{`${language === LANGUAGES.russian ? 'Включить местоположение в настройках' : 'Turn on location services in settings'}`}</Text>
      <Switch
        value={isLocationEnabled}
        onValueChange={async () => {
          try {
            const request = await startActivityAsync(ActivityAction.LOCATION_SOURCE_SETTINGS);
            if (request) {
              setIsNeedToRefreshPermission(true);
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
