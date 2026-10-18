import { fireEvent, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import SocialAuthButtons from './social-auth-buttons';

describe('SocialAuthButtons', () => {
  it('opens the selected provider sign-in page', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined);
    await renderWithProviders(<SocialAuthButtons />);

    fireEvent.press(screen.getByTestId('yandex-auth'));

    expect(openURL).toHaveBeenCalledWith(expect.stringContaining('/auth/yandex'));
    openURL.mockRestore();
  });
});
