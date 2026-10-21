import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { LEGAL_DOCUMENT_LABELS } from '../content';
import LegalIndexPage from './legal-index-page';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('LegalIndexPage', () => {
  it('lists the documents and opens the selected one', async () => {
    await renderWithProviders(<LegalIndexPage language={LANGUAGES.russian} />);

    fireEvent.press(screen.getByText(LEGAL_DOCUMENT_LABELS.russian.privacy));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.privacyPolicy}`);
  });
});
