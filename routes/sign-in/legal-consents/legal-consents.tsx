import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Checkbox, Text, useTheme } from 'react-native-paper';
import { LANGUAGES, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';

export interface LegalConsentValues {
  agreementAndPolicy: boolean;
  personalData: boolean;
}

interface LegalConsentsProps {
  values: LegalConsentValues;
  onChange: (key: keyof LegalConsentValues) => void;
}

export default function LegalConsents({ values, onChange }: LegalConsentsProps) {
  const { colors } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;
  const documentPath = (route: ROUTES, englishRoute: ROUTES = route) =>
    `/${isRussian ? route : englishRoute}` as Parameters<typeof push>[0];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Checkbox
          testID="legal-consent-agreement"
          status={values.agreementAndPolicy ? 'checked' : 'unchecked'}
          onPress={() => onChange('agreementAndPolicy')}
          color={colors.primary}
        />
        <Text variant="bodySmall" style={styles.label}>
          {isRussian ? 'Я принимаю условия ' : 'I accept the '}
          <Text
            variant="bodySmall"
            style={[styles.link, { color: colors.primary }]}
            accessibilityRole="link"
            onPress={() => push(documentPath(ROUTES.userAgreement, ROUTES.userAgreementEnglish))}>
            {isRussian ? 'Пользовательского соглашения' : 'User Agreement'}
          </Text>
          {isRussian ? ' и ознакомлен(а) с ' : ' and have read the '}
          <Text
            variant="bodySmall"
            style={[styles.link, { color: colors.primary }]}
            accessibilityRole="link"
            onPress={() => push(documentPath(ROUTES.privacyPolicy, ROUTES.privacyPolicyEnglish))}>
            {isRussian ? 'Политикой в отношении обработки персональных данных' : 'Personal Data Processing Policy'}
          </Text>
        </Text>
      </View>

      <View style={styles.row}>
        <Checkbox
          testID="legal-consent-personal-data"
          status={values.personalData ? 'checked' : 'unchecked'}
          onPress={() => onChange('personalData')}
          color={colors.primary}
        />
        <Text variant="bodySmall" style={styles.label}>
          {isRussian ? 'Я выражаю свое ' : 'I give my '}
          <Text
            variant="bodySmall"
            style={[styles.link, { color: colors.primary }]}
            accessibilityRole="link"
            onPress={() => push(documentPath(ROUTES.consents, ROUTES.consentsEnglish))}>
            {isRussian ? 'согласие' : 'consent'}
          </Text>
          {isRussian ? ' на обработку моих персональных данных' : ' to the processing of my personal data'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    marginTop: 4,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 4,
  },
  label: {
    flex: 1,
    lineHeight: 19,
    paddingTop: 8,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
