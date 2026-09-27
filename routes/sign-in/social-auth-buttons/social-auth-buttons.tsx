import Svg, { Path } from 'react-native-svg';
import { Linking, View, StyleSheet } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { SOCIAL_AUTH_TEXT, VK_AUTH_URL, YANDEX_AUTH_URL } from '../const';

export default function SocialAuthButtons() {
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = SOCIAL_AUTH_TEXT[language];

  return (
    <View style={styles.layout}>
      <View style={styles.buttons}>
        <TouchableRipple
          testID="yandex-auth"
          accessibilityLabel={copy.yandex}
          style={[styles.button, styles.yandexButton]}
          onPress={() => void Linking.openURL(YANDEX_AUTH_URL)}
          rippleColor="rgba(255, 255, 255, 0.2)"
          accessibilityRole="button">
          <View style={styles.buttonContent}>
            <View style={styles.iconFrame}>
              <YandexIdIcon />
            </View>
            <Text style={styles.buttonLabel}>{copy.yandex}</Text>
          </View>
        </TouchableRipple>
        <TouchableRipple
          testID="vk-auth"
          accessibilityLabel={copy.vk}
          style={[styles.button, styles.vkButton]}
          onPress={() => void Linking.openURL(VK_AUTH_URL)}
          rippleColor="rgba(255, 255, 255, 0.2)"
          accessibilityRole="button">
          <View style={styles.buttonContent}>
            <View style={styles.iconFrame}>
              <VkIdIcon />
            </View>
            <Text style={styles.buttonLabel}>{copy.vk}</Text>
          </View>
        </TouchableRipple>
      </View>
    </View>
  );
}

function YandexIdIcon() {
  return (
    <Svg width={17} height={17} viewBox="3.5 3.5 17 17">
      <Path
        d="M16.6 4.5h-5.1c-3.1 0-5.05 1.6-5.05 4.25 0 2.15 1.16 3.5 3.15 3.95L5.5 19.5h3.7l4.15-6.45h2.1v6.45h3.1v-15H16.6Zm-1.15 6.1h-3.2c-1.65 0-2.45-.6-2.45-1.8 0-1.25.85-1.9 2.45-1.9h3.2v3.7Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function VkIdIcon() {
  return (
    <Svg width={20} height={20} viewBox="5.8 9.5 16.2 10.5">
      <Path
        d="M6.8 10.15c.118 5.723 3.13 9.16 8.093 9.16h.288v-3.26c1.808.183 3.156 1.53 3.707 3.26h2.606c-.707-2.606-2.54-4.05-3.68-4.6 1.139-.681 2.75-2.32 3.13-4.56h-2.371c-.498 1.82-1.978 3.473-3.392 3.63v-3.63h-2.409v6.35c-1.466-.367-3.379-2.147-3.457-6.35H6.8Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  layout: { marginBottom: 4, width: '100%' },
  buttons: { flexDirection: 'row', gap: 12, width: '100%' },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  buttonLabel: { color: '#FFFFFF', fontWeight: '600' },
  yandexButton: { backgroundColor: '#FC3F1D' },
  vkButton: { backgroundColor: '#0077FF' },
  iconFrame: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
});
