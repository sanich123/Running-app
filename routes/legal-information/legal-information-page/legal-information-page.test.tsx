import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import LegalInformationPage from './legal-information-page';

describe('LegalInformationPage', () => {
  it('opens the Russian legal information index', async () => {
    await renderWithProviders(<LegalInformationPage />);

    expect(screen.getByText('Юридическая информация')).toBeOnTheScreen();
  });
});
