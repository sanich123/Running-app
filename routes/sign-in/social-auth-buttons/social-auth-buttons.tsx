import { StyleSheet, View } from 'react-native';
import AppleAuthButton from './apple-auth-button/apple-auth-button';
import VkAuthButton from './vk-auth-button/vk-auth-button';
import YandexAuthButton from './yandex-auth-button/yandex-auth-button';

export default function SocialAuthButtons() {
  return (
    <View style={styles.layout}>
      <View style={styles.buttons}>
        <YandexAuthButton />
        <VkAuthButton />
      </View>
      <AppleAuthButton />
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { marginBottom: 4, width: '100%' },
  buttons: { flexDirection: 'row', gap: 12, width: '100%' },
});
