import { openSettings, openURL } from 'expo-linking';
import { Platform } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { APP_SETTINGS_TEXT_BY_LANGUAGE } from './const';

export default function AppSettingsBtn() {
  const { language } = useAppSelector(({ settings }) => settings);

  return (
    <TouchableRipple
      testID="app-settings-button"
      borderless
      style={{ display: 'flex', justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 15, borderRadius: 5 }}
      onPress={async () => {
        try {
          if (Platform.OS === 'ios') await openURL('App-prefs:');
          else await openSettings();
        } catch (error) {
          errorToast('Не удалось открыть настройки устройства', error);
        }
      }}>
      <Text variant="bodyLarge">{APP_SETTINGS_TEXT_BY_LANGUAGE[language]}</Text>
    </TouchableRipple>
  );
}
