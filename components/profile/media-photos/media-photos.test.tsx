import { changeLanguage } from '@R/language/language';
import { BAD_REQUEST } from '@T/mocks/mock-requests';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { errorExtracter } from '@U/error-handler';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { PROFILE_MEDIA } from './const';
import ProfileMediaPhotos from './media-photos';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => 'somePathname',
}));

describe('Profile media photos', () => {
  it('should correctly renders data in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<ProfileMediaPhotos userId="someUserId" />, { store: mockStore });
    await screen.debug();
    expect(await screen.findByText(new RegExp(`${PROFILE_MEDIA.english.label}`))).toBeOnTheScreen();
  });
  it('should correctly renders data in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<ProfileMediaPhotos userId="someUserId" />, { store: mockStore });
    expect(await screen.findByText(new RegExp(`${PROFILE_MEDIA.russian.label}`))).toBeOnTheScreen();
  });
  it('should correctly handle an error in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<ProfileMediaPhotos userId="someWrongUserId" />, { store: mockStore });
    expect(
      await screen.findByText(new RegExp(`${PROFILE_MEDIA.russian.error}: ${errorExtracter(BAD_REQUEST)}`)),
    ).toBeOnTheScreen();
  });
  it('should correctly handle an error in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<ProfileMediaPhotos userId="someWrongUserId" />, { store: mockStore });
    expect(
      await screen.findByText(new RegExp(`${PROFILE_MEDIA.english.error}: ${errorExtracter(BAD_REQUEST)}`)),
    ).toBeOnTheScreen();
  });
});
