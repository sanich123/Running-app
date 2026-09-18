import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { LANGUAGES, ROUTES } from '@const/enums';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { LEGAL_DOCUMENT_LABELS, LEGAL_DOCUMENT_VERSION, LEGAL_OPERATOR, type LegalDocumentId } from './content';

const DOCUMENTS: LegalDocumentId[] = ['agreement', 'consents', 'privacy', 'locationConsent', 'accountDeletion'];

const DOCUMENT_PATHS: Record<LegalDocumentId, { russian: string; english: string }> = {
  privacy: { russian: `/${ROUTES.privacyPolicy}`, english: `/${ROUTES.privacyPolicyEnglish}` },
  consents: { russian: `/${ROUTES.consents}`, english: `/${ROUTES.consentsEnglish}` },
  agreement: { russian: `/${ROUTES.userAgreement}`, english: `/${ROUTES.userAgreementEnglish}` },
  locationConsent: { russian: `/${ROUTES.locationConsent}`, english: `/${ROUTES.locationConsentEnglish}` },
  accountDeletion: { russian: `/${ROUTES.accountDeletion}`, english: `/${ROUTES.accountDeletionEnglish}` },
};

export default function LegalIndexPage({ language }: { language: LANGUAGES }) {
  const { colors } = useTheme();
  const { push } = useRouter();
  const navigate = (path: string) => push(path as Parameters<typeof push>[0]);
  const labels = LEGAL_DOCUMENT_LABELS[language];

  return (
    <CrossPlatformLayout scrollViewEnabled outerStyles={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>
        {labels.legalInformation}
      </Text>
      <Text variant="bodyMedium" style={styles.paragraph}>
        {language === LANGUAGES.russian
          ? 'Оператор приложения Runich и документы, которые регулируют обработку данных и использование сервиса.'
          : 'The Runich controller and the documents governing data processing and use of the service.'}
      </Text>

      <View style={[styles.operator, { borderColor: colors.outlineVariant, backgroundColor: colors.surface }]}>
        <Text variant="bodyMedium" style={styles.heading}>
          {language === LANGUAGES.russian ? 'Оператор' : 'Controller'}
        </Text>
        <Text variant="bodyMedium">{LEGAL_OPERATOR.name}</Text>
        <Text variant="bodyMedium">
          <Text style={styles.label}>{language === LANGUAGES.russian ? 'Страна' : 'Country'}: </Text>
          {language === LANGUAGES.russian ? LEGAL_OPERATOR.countryRussian : LEGAL_OPERATOR.countryEnglish}
        </Text>
        <Text variant="bodyMedium">
          <Text style={styles.label}>{language === LANGUAGES.russian ? 'Статус' : 'Status'}: </Text>
          {language === LANGUAGES.russian ? LEGAL_OPERATOR.statusRussian : LEGAL_OPERATOR.statusEnglish}
        </Text>
        <Text variant="bodyMedium">
          <Text style={styles.label}>{language === LANGUAGES.russian ? 'ИНН' : 'INN'}: </Text>
          {LEGAL_OPERATOR.inn}
        </Text>
        <Text variant="bodyMedium">{LEGAL_OPERATOR.email}</Text>
      </View>

      <Text variant="bodyMedium" style={styles.heading}>
        {language === LANGUAGES.russian ? 'Документы' : 'Documents'}
      </Text>
      {DOCUMENTS.map((documentId) => (
        <Pressable
          key={documentId}
          accessibilityRole="link"
          onPress={() => navigate(DOCUMENT_PATHS[documentId][language])}
          style={[styles.documentLink, { borderBottomColor: colors.outlineVariant }]}>
          <Text style={{ color: colors.primary }}>{labels[documentId]}</Text>
        </Pressable>
      ))}

      <View style={[styles.languageLinks, { borderTopColor: colors.outlineVariant }]}>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {language === LANGUAGES.russian ? 'English version:' : 'Русская версия:'}
        </Text>
        <Pressable
          accessibilityRole="link"
          onPress={() => navigate(`/${ROUTES.legalInformation}${language === LANGUAGES.russian ? '-en' : ''}`)}>
          <Text style={{ color: colors.primary }}>
            {language === LANGUAGES.russian ? 'Legal information' : 'Юридическая информация'}
          </Text>
        </Pressable>
      </View>

      <Text variant="bodySmall" style={[styles.version, { color: colors.onSurfaceVariant }]}>
        {LEGAL_DOCUMENT_VERSION[language]}
      </Text>
    </CrossPlatformLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
  },
  paragraph: {
    marginTop: 8,
    textAlign: 'justify',
  },
  operator: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    marginTop: 14,
    padding: 12,
  },
  heading: {
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 4,
    marginTop: 18,
  },
  label: {
    fontWeight: '600',
  },
  documentLink: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  languageLinks: {
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
    paddingTop: 12,
  },
  version: {
    marginTop: 12,
  },
});
