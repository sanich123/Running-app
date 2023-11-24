import { screen, userEvent } from '@testing-library/react-native';

import * as auth from '../../auth/context/auth-context';
import { UPDATE_BTN } from '../../components/profile-update-btn/const';
import ProfileUpdateBtn from '../../components/profile-update-btn/profile-update-btn';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { USER_AUTH_MOCKS } from '../mocks/use-auth';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
describe('Profile update btn', () => {
  it('should correctly renders in english', () => {
    renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    expect(screen.getByText(UPDATE_BTN.english.update)).toBeOnTheScreen();
  });
  it('should correctly interract with the user', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    const updateBtn = screen.getByText(UPDATE_BTN.english.update);
    expect(mockStore.getState().profile.isDisabledWhileSendingProfile).toEqual(false);
    await userEvent.press(updateBtn);
    expect(mockStore.getState().profile.isDisabledWhileSendingProfile).toEqual(false);
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    expect(screen.getByText(UPDATE_BTN.russian.update)).toBeOnTheScreen();
  });
});
