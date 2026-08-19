import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/settings/settings';
import { RESET_STORE } from '@R/store';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { SETTINGS } from '../const';
import LogoutBtn from './logout-btn';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    canDismiss: () => false,
    dismissAll: jest.fn(),
    replace: mockReplace,
  }),
}));

describe('logout btn', () => {
  it('clears the session and returns to sign in', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setUserId('logged-user'));
    const dispatch = jest.spyOn(mockStore, 'dispatch');
    await renderWithProviders(<LogoutBtn />);
    await user.press(screen.getByText(SETTINGS.english.logout));
    await waitFor(() => expect(dispatch).toHaveBeenCalledWith({ type: RESET_STORE }));
    expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.signIn}`);
  });
});
