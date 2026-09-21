import { Pressable, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { LANGUAGES, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';

export default function LegalLinks() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;
  return (
    <View style={styles.layout}>
      <Text variant="bodySmall" style={styles.caption}>
        {isRussian ? 'Продолжая, вы соглашаетесь с' : 'By continuing, you agree to the'}
      </Text>
      <View style={styles.links}>
        <Pressable
          onPress={() => push(`/${isRussian ? ROUTES.userAgreement : ROUTES.userAgreementEnglish}`)}
          accessibilityRole="link">
          <Text variant="bodySmall" style={[styles.link, { color: colors.primary }]}>
            {isRussian ? 'Пользовательским соглашением' : 'User Agreement'}
          </Text>
        </Pressable>
        <Text variant="bodySmall" style={styles.caption}>
          {isRussian ? 'и' : 'and'}
        </Text>
        <Pressable
          onPress={() => push(`/${isRussian ? ROUTES.privacyPolicy : ROUTES.privacyPolicyEnglish}`)}
          accessibilityRole="link">
          <Text variant="bodySmall" style={[styles.link, { color: colors.primary }]}>
            {isRussian ? 'Политикой в отношении обработки персональных данных' : 'Personal Data Processing Policy'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { alignItems: 'center', gap: 0, marginTop: 10 },
  links: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center' },
  caption: { opacity: 0.65, textAlign: 'center' },
  link: { textAlign: 'center' },
});
