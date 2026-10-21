import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { LEGAL_DOCUMENT_LABELS, LEGAL_DOCUMENTS } from '../content';
import LegalDocumentPage from './legal-document-page';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('LegalDocumentPage', () => {
  it('shows the selected document and navigates to a related document', async () => {
    await renderWithProviders(<LegalDocumentPage documentId="privacy" language={LANGUAGES.russian} />);

    expect(screen.getByText(LEGAL_DOCUMENTS.russian.privacy.title)).toBeOnTheScreen();
    fireEvent.press(screen.getByText(LEGAL_DOCUMENT_LABELS.russian.agreement));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.userAgreement}`);
  });
});
