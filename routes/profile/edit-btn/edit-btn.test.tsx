import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { EDIT_BTN } from './const';
import ProfileEditBtn from './edit-btn';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('Profile edit btn', () => {
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ProfileEditBtn />, { store: mockStore });
    expect(screen.getByText(EDIT_BTN.english.edit)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<ProfileEditBtn />, { store: mockStore });
    expect(screen.getByText(EDIT_BTN.russian.edit)).toBeOnTheScreen();
  });

  it('opens profile settings', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ProfileEditBtn />);
    await user.press(screen.getByText(EDIT_BTN.russian.edit));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.profile}/${ROUTES.profileSettings}/`);
  });
});
