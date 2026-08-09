import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ChangePassword from './change-password';
import { CHANGE_PASSWORD_TEST_ID } from './const';

jest.mock('expo-router', () => ({ Stack: { Screen: () => null } }));

describe('change password', () => {
  it('shows and hides the password when the eye is pressed', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ChangePassword />);
    expect(screen.getByTestId(CHANGE_PASSWORD_TEST_ID.input).props.secureTextEntry).toBe(true);
    await user.press(screen.getByTestId(CHANGE_PASSWORD_TEST_ID.visibility));
    expect(screen.getByTestId(CHANGE_PASSWORD_TEST_ID.input).props.secureTextEntry).toBe(false);
  });
});
