import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { LEGAL_DOCUMENT_LABELS, LEGAL_DOCUMENT_VERSION, LEGAL_DOCUMENTS, type LegalDocumentId } from './content';
import type { LANGUAGES } from '@const/enums';

const RELATED_DOCUMENTS: Record<LegalDocumentId, LegalDocumentId[]> = {
  privacy: ['agreement', 'consents', 'locationConsent', 'accountDeletion'],
  agreement: ['privacy', 'consents', 'locationConsent', 'accountDeletion'],
  consents: ['privacy', 'agreement', 'locationConsent', 'accountDeletion'],
  locationConsent: ['privacy', 'agreement', 'consents', 'accountDeletion'],
  accountDeletion: ['privacy', 'agreement', 'consents', 'locationConsent'],
};

const DOCUMENT_PATHS: Record<LegalDocumentId, { russian: string; english: string }> = {
  privacy: { russian: `/${ROUTES.privacyPolicy}`, english: `/${ROUTES.privacyPolicyEnglish}` },
  agreement: { russian: `/${ROUTES.userAgreement}`, english: `/${ROUTES.userAgreementEnglish}` },
  consents: { russian: `/${ROUTES.consents}`, english: `/${ROUTES.consentsEnglish}` },
  locationConsent: { russian: `/${ROUTES.locationConsent}`, english: `/${ROUTES.locationConsentEnglish}` },
  accountDeletion: { russian: `/${ROUTES.accountDeletion}`, english: `/${ROUTES.accountDeletionEnglish}` },
};

export default function LegalDocumentPage({
  documentId,
  language,
}: {
  documentId: LegalDocumentId;
  language: LANGUAGES;
}) {
  const { colors } = useTheme();
  const { push } = useRouter();
  const navigate = (path: string) => push(path as Parameters<typeof push>[0]);
  const document = LEGAL_DOCUMENTS[language][documentId];
  const labels = LEGAL_DOCUMENT_LABELS[language];

  return (
    <CrossPlatformLayout scrollViewEnabled outerStyles={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          {document.title}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {LEGAL_DOCUMENT_VERSION[language]}
        </Text>
      </View>

      {document.intro.map((paragraph) => (
        <Text key={paragraph} variant="bodyMedium" style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}

      {document.sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text variant="bodyMedium" style={styles.heading}>
            {section.heading}
          </Text>
          {section.paragraphs.map((paragraph, index) => (
            <Text
              key={`${section.heading}-${index}`}
              variant="bodyMedium"
              style={[styles.paragraph, index > 0 && styles.nextParagraph]}>
              {paragraph}
            </Text>
          ))}
          {section.bullets?.map((bullet) => (
            <Text key={bullet} variant="bodyMedium" style={styles.bullet}>
              {'• '}
              {bullet}
            </Text>
          ))}
        </View>
      ))}

      {document.footer && (
        <Text variant="bodySmall" style={[styles.footer, { color: colors.onSurfaceVariant }]}>
          {document.footer}
        </Text>
      )}

      <View style={[styles.related, { borderTopColor: colors.outlineVariant }]}>
        <Text variant="bodyMedium" style={styles.heading}>
          {language === 'russian' ? 'Связанные документы' : 'Related documents'}
        </Text>
        {RELATED_DOCUMENTS[documentId].map((relatedDocumentId) => (
          <Pressable
            key={relatedDocumentId}
            accessibilityRole="link"
            onPress={() => navigate(DOCUMENT_PATHS[relatedDocumentId][language])}
            style={styles.relatedLink}>
            <Text style={{ color: colors.primary }}>{labels[relatedDocumentId]}</Text>
          </Pressable>
        ))}
      </View>
    </CrossPlatformLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  title: {
    textAlign: 'center',
  },
  section: {
    marginTop: 14,
  },
  heading: {
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 2,
  },
  paragraph: {
    marginTop: 2,
    textAlign: 'justify',
  },
  nextParagraph: {
    marginTop: 5,
  },
  bullet: {
    marginLeft: 4,
    marginTop: 5,
  },
  footer: {
    marginTop: 16,
  },
  related: {
    borderTopWidth: 1,
    gap: 5,
    marginTop: 20,
    paddingTop: 12,
  },
  relatedLink: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
});
