import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { UPDATE_BTN } from './const';
import ProfileUpdateBtn from './update-btn';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: mockBack }),
}));
describe('Profile update btn', () => {
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    expect(screen.getByText(UPDATE_BTN.english.update)).toBeOnTheScreen();
  });
  it('should correctly interract with the user', async () => {
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    const updateBtn = screen.getByText(UPDATE_BTN.english.update);
    expect(mockStore.getState().profile.isDisabledWhileSendingProfile).toEqual(false);
    await userEvent.press(updateBtn);
    expect(mockStore.getState().profile.isDisabledWhileSendingProfile).toEqual(false);
  });

  it('returns to the profile after successfully updating it', async () => {
    mockBack.mockClear();
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    const updateBtn = screen.getByText(UPDATE_BTN.english.update);
    await userEvent.press(updateBtn);
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    expect(screen.getByText(UPDATE_BTN.russian.update)).toBeOnTheScreen();
  });
});
