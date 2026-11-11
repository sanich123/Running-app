import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import SocialAuthButtons from './social-auth-buttons';

describe('SocialAuthButtons', () => {
  it('renders the supported social sign-in buttons', async () => {
    await renderWithProviders(<SocialAuthButtons />);

    expect(screen.getByTestId('yandex-auth')).toBeTruthy();
    expect(screen.getByTestId('vk-auth')).toBeTruthy();
  });
});
