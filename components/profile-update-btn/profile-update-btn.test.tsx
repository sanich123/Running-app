import * as auth from '@A/context/auth-context';
import { changeLanguage } from '@R/language/language';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen, userEvent } from '@testing-library/react-native';

import { UPDATE_BTN } from './const';
import ProfileUpdateBtn from './profile-update-btn';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));
describe('Profile update btn', () => {
  it('should correctly renders in english', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
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
