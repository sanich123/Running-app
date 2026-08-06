import { openSettings, openURL } from 'expo-linking';
import { Platform } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

export default function AppSettingsBtn() {
  return (
    <TouchableRipple
      borderless
      style={{ display: 'flex', justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 15, borderRadius: 5 }}
      onPress={async () => (Platform.OS === 'ios' ? await openURL('App-prefs:') : await openSettings())}>
      <Text variant="bodyLarge">Настройки телефона</Text>
    </TouchableRipple>
  );
}
