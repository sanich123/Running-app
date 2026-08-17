import { useEffect, useState } from 'react';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import { hasServicesEnabledAsync } from 'expo-location';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import type { LocationSettingsSwitcherProps } from '../types';

export default function LocationSettingsSwitcher({
  isLocationEnabled,
  setIsLocationEnabled,
}: LocationSettingsSwitcherProps) {
  const [isNeedToRefreshPermission, setIsNeedToRefreshPermission] = useState(false);
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  useEffect(() => {
    async function isLocationServicesEnabled() {
      try {
        const isLocationEnabled = await hasServicesEnabledAsync();
        setIsLocationEnabled(isLocationEnabled);
      } catch (error) {
        errorToast('Не удалось проверить службы геолокации', error);
      }
    }
    if (!isLocationEnabled || isNeedToRefreshPermission) {
      isLocationServicesEnabled();
    }
  }, [setIsLocationEnabled, isLocationEnabled, isNeedToRefreshPermission]);

  return (
    <View style={[styles.switcherWrapper, { borderColor: colors.outlineVariant, backgroundColor: colors.surface }]}>
      <View style={styles.textWrapper}>
        <Text variant="titleSmall" style={styles.title}>
          {language === LANGUAGES.russian ? 'Службы геолокации' : 'Location services'}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {language === LANGUAGES.russian
            ? 'Включите геолокацию в настройках телефона'
            : 'Turn on location services in phone settings'}
        </Text>
      </View>
      <Button
        testID="location-settings-open"
        mode="outlined"
        compact
        icon="cog-outline"
        onPress={async () => {
          try {
            const request = await startActivityAsync(ActivityAction.LOCATION_SOURCE_SETTINGS);
            if (request) {
              setIsNeedToRefreshPermission(true);
            }
          } catch (error) {
            errorToast('Не удалось открыть настройки геолокации', error);
          }
        }}>
        {' '}
        {language === LANGUAGES.russian ? 'Открыть' : 'Open'}{' '}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  switcherWrapper: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    padding: 12,
  },
  textWrapper: { flex: 1, gap: 4 },
  title: { fontWeight: '700' },
});
