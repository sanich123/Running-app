import { openSettings, openURL } from 'expo-linking';
import { Platform } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { APP_SETTINGS_TEXT } from './const';

export default function AppSettingsBtn() {
  return (
    <TouchableRipple
      testID="app-settings-button"
      borderless
      style={{ display: 'flex', justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 15, borderRadius: 5 }}
      onPress={async () => (Platform.OS === 'ios' ? await openURL('App-prefs:') : await openSettings())}>
      <Text variant="bodyLarge">{APP_SETTINGS_TEXT}</Text>
    </TouchableRipple>
  );
}
