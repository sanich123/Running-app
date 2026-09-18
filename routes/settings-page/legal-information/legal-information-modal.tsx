import type { RefObject } from 'react';
import { useCallback } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { LANGUAGES, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { LEGAL_DOCUMENT_LABELS, type LegalDocumentId } from '@Routes/legal-documents/content';

const DOCUMENTS: {
  id: LegalDocumentId;
  route: ROUTES;
  englishRoute: ROUTES;
}[] = [
  { id: 'agreement', route: ROUTES.userAgreement, englishRoute: ROUTES.userAgreementEnglish },
  { id: 'consents', route: ROUTES.consents, englishRoute: ROUTES.consentsEnglish },
  { id: 'privacy', route: ROUTES.privacyPolicy, englishRoute: ROUTES.privacyPolicyEnglish },
];

export default function LegalInformationModal({
  legalInformationModalRef,
}: {
  legalInformationModalRef: RefObject<BottomSheetModal | null>;
}) {
  const { colors } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;
  const documentPath = (route: ROUTES, englishRoute: ROUTES) =>
    `/${isRussian ? route : englishRoute}` as Parameters<typeof push>[0];
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );

  return (
    <BottomSheetModal
      ref={legalInformationModalRef}
      index={0}
      snapPoints={['55%']}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}>
      <BottomSheetView style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View style={styles.items}>
          {DOCUMENTS.map(({ id, route, englishRoute }) => (
            <TouchableRipple
              key={id}
              testID={`legal-information-${id}`}
              borderless
              onPress={() => {
                legalInformationModalRef.current?.dismiss();
                push(documentPath(route, englishRoute));
              }}
              rippleColor={colors.primaryContainer}
              style={[styles.item, { backgroundColor: colors.background }]}>
              <View style={styles.itemContent}>
                <Text variant="bodyLarge" style={styles.itemTitle}>
                  {LEGAL_DOCUMENT_LABELS[language][id]}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
              </View>
            </TouchableRipple>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  items: {
    gap: 12,
  },
  item: {
    borderRadius: 18,
    minHeight: 72,
    overflow: 'hidden',
  },
  itemContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 72,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  itemTitle: {
    flex: 1,
    textAlign: 'center',
  },
});
