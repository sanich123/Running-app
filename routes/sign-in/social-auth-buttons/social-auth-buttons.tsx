import { FontAwesome5 } from '@expo/vector-icons';
import { Linking, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { VK_AUTH_URL, YANDEX_AUTH_URL } from '../const';

export default function SocialAuthButtons() {
  return (
    <View style={styles.layout}>
      <Button
        mode="contained"
        testID="yandex-auth"
        contentStyle={styles.buttonContent}
        style={[styles.button, styles.yandexButton]}
        onPress={() => void Linking.openURL(YANDEX_AUTH_URL)}>
        <View style={styles.label}>
          <FontAwesome5 name="yandex" size={17} color="#FFFFFF" style={styles.yandexIcon} />
          <Text style={styles.buttonText}>Войти с Яндекс ID</Text>
        </View>
      </Button>
      <Button
        mode="contained"
        testID="vk-auth"
        contentStyle={styles.buttonContent}
        style={[styles.button, styles.vkButton]}
        onPress={() => void Linking.openURL(VK_AUTH_URL)}>
        <View style={styles.label}>
          <FontAwesome5 name="vk" size={22} color="#FFFFFF" />
          <Text style={styles.buttonText}>Войти с VK ID</Text>
        </View>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { gap: 8, marginBottom: 16 },
  button: { borderRadius: 8 },
  yandexButton: { backgroundColor: '#FC3F1D' },
  vkButton: { backgroundColor: '#0077FF' },
  buttonContent: { height: 48, justifyContent: 'center', paddingHorizontal: 0 },
  label: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  yandexIcon: { transform: [{ translateY: 2 }], width: 22 },
  buttonText: { color: '#FFFFFF', fontWeight: '600' },
});
