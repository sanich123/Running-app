import { Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Checkbox, Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { LEGAL_CONSENTS_COPY } from './const';
import type { LegalConsentsProps } from './types';

export default function LegalConsents({ values, onChange }: LegalConsentsProps) {
  const { colors } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === 'russian';
  const copy = LEGAL_CONSENTS_COPY[language];
  const CheckboxComponent = Platform.OS === 'ios' ? Checkbox.IOS : Checkbox.Android;
  const documentPath = (route: ROUTES, englishRoute: ROUTES = route) =>
    `/${isRussian ? route : englishRoute}` as Parameters<typeof push>[0];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <CheckboxComponent
          testID="legal-consent-agreement"
          accessibilityLabel={copy.agreementAccessibilityLabel}
          accessibilityState={{ checked: values.agreementAndPolicy }}
          aria-checked={values.agreementAndPolicy}
          status={values.agreementAndPolicy ? 'checked' : 'unchecked'}
          onPress={() => onChange('agreementAndPolicy')}
          color={colors.primary}
        />
        <Text variant="bodySmall" style={styles.label}>
          {copy.agreementPrefix}
          <Text
            variant="bodySmall"
            style={[styles.link, { color: colors.primary }]}
            accessibilityRole="link"
            onPress={() => push(documentPath(ROUTES.userAgreement, ROUTES.userAgreementEnglish))}>
            {copy.agreementLink}
          </Text>
          {copy.agreementConnector}
          <Text
            variant="bodySmall"
            style={[styles.link, { color: colors.primary }]}
            accessibilityRole="link"
            onPress={() => push(documentPath(ROUTES.privacyPolicy, ROUTES.privacyPolicyEnglish))}>
            {copy.privacyPolicyLink}
          </Text>
        </Text>
      </View>

      <View style={styles.row}>
        <CheckboxComponent
          testID="legal-consent-personal-data"
          accessibilityLabel={copy.personalDataAccessibilityLabel}
          accessibilityState={{ checked: values.personalData }}
          aria-checked={values.personalData}
          status={values.personalData ? 'checked' : 'unchecked'}
          onPress={() => onChange('personalData')}
          color={colors.primary}
        />
        <Text variant="bodySmall" style={styles.label}>
          {copy.personalDataPrefix}
          <Text
            variant="bodySmall"
            style={[styles.link, { color: colors.primary }]}
            accessibilityRole="link"
            onPress={() => push(documentPath(ROUTES.consents, ROUTES.consentsEnglish))}>
            {copy.personalDataLink}
          </Text>
          {copy.personalDataSuffix}
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
