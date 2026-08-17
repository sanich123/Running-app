import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { getErrorMessageFromError } from '@S/error-toast/error-toast';
import { BAD_REQUEST } from '@T/mocks/mock-requests';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { PROFILE_MEDIA } from './const';
import ProfileMediaPhotos from './media-photos';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => 'somePathname',
}));
describe('Profile media photos', () => {
  it('should correctly renders data in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ProfileMediaPhotos userId="someUserId" />, { store: mockStore });
    expect(await screen.findByText(new RegExp(`${PROFILE_MEDIA.english.label}`))).toBeOnTheScreen();
  });
  it('should correctly renders data in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<ProfileMediaPhotos userId="someUserId" />, { store: mockStore });
    expect(await screen.findByText(new RegExp(`${PROFILE_MEDIA.russian.label}`))).toBeOnTheScreen();
  });
  it('should correctly handle an error in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<ProfileMediaPhotos userId="someWrongUserId" />, { store: mockStore });
    expect(
      await screen.findByText(
        new RegExp(`${PROFILE_MEDIA.russian.error}: ${getErrorMessageFromError({ status: 400, data: BAD_REQUEST })}`),
      ),
    ).toBeOnTheScreen();
  });
  it('should correctly handle an error in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ProfileMediaPhotos userId="someWrongUserId" />, { store: mockStore });
    expect(
      await screen.findByText(
        new RegExp(`${PROFILE_MEDIA.english.error}: ${getErrorMessageFromError({ status: 400, data: BAD_REQUEST })}`),
      ),
    ).toBeOnTheScreen();
  });

  it('opens the complete media grid', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ProfileMediaPhotos userId="someUserId" />);
    await user.press(await screen.findByText(new RegExp(PROFILE_MEDIA.english.label)));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.mediaGrid}/someUserId`);
  });
});
