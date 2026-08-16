import { Linking, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { VK_AUTH_URL, YANDEX_AUTH_URL } from '../const';

export default function SocialAuthButtons() {
  return (
    <View style={styles.layout}>
      <Button
        mode="outlined"
        testID="yandex-auth"
        contentStyle={styles.buttonContent}
        style={styles.button}
        onPress={() => void Linking.openURL(YANDEX_AUTH_URL)}>
        <View style={styles.label}>
          <View style={styles.yandexIcon}>
            <Text style={styles.yandexIconText}>Я</Text>
          </View>
          <Text style={styles.buttonText}>Войти через Яндекс</Text>
        </View>
      </Button>
      <Button
        mode="outlined"
        testID="vk-auth"
        contentStyle={styles.buttonContent}
        style={styles.button}
        onPress={() => void Linking.openURL(VK_AUTH_URL)}>
        <View style={styles.label}>
          <View style={styles.vkIcon}>
            <Text style={styles.vkIconText}>vk</Text>
          </View>
          <Text style={styles.buttonText}>Войти через VK</Text>
        </View>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { gap: 8, marginBottom: 16 },
  button: { backgroundColor: '#FFFFFF', borderColor: '#D9D9D9', borderRadius: 8 },
  buttonContent: { height: 48, justifyContent: 'center', paddingHorizontal: 0 },
  label: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  buttonText: { color: '#1F1F1F', fontWeight: '600' },
  yandexIcon: { alignItems: 'center', backgroundColor: '#FC3F1D', borderRadius: 6, height: 24, justifyContent: 'center', width: 24 },
  yandexIconText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', lineHeight: 20, textAlign: 'center' },
  vkIcon: { alignItems: 'center', backgroundColor: '#0077FF', borderRadius: 6, height: 24, justifyContent: 'center', width: 24 },
  vkIconText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', lineHeight: 14, textAlign: 'center' },
});
