import { useRef } from 'react';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import LegalInformationModal from './legal-information-modal/legal-information-modal';
import SettingsRow from '../settings-row/settings-row';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function LegalInformation() {
  const legalInformationModalRef = useRef<BottomSheetModal>(null);
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;

  return (
    <>
      <SettingsRow
        testID="legal-information-settings-row"
        icon="file-document-outline"
        title={isRussian ? 'Юридическая информация' : 'Legal information'}
        description={isRussian ? 'Документы и согласия Runich' : 'Runich documents and consents'}
        onPress={() => legalInformationModalRef.current?.present()}
      />
      <LegalInformationModal legalInformationModalRef={legalInformationModalRef} />
    </>
  );
}
