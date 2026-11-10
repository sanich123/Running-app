import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { LEGAL_DOCUMENT_LABELS } from '@Routes/legal-documents/content';
import { renderWithProviders } from '@T/utils/test-utils';
import LegalInformationPage from './legal-information-page';

describe('LegalInformationPage', () => {
  it('opens the Russian legal information index', async () => {
    await renderWithProviders(<LegalInformationPage />);

    expect(screen.getByText(LEGAL_DOCUMENT_LABELS[LANGUAGES.russian].legalInformation)).toBeOnTheScreen();
  });
});
