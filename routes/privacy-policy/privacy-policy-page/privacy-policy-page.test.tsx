import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import PrivacyPolicyPage from './privacy-policy-page';

describe('PrivacyPolicyPage', () => {
  it('shows the Russian privacy document', async () => {
    await renderWithProviders(<PrivacyPolicyPage />);

    expect(screen.getByText(/Политика в отношении обработки персональных данных/)).toBeOnTheScreen();
  });
});
