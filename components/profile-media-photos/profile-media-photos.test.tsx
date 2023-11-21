import { screen } from '@testing-library/react-native';

import { PROFILE_MEDIA } from './const';
import ProfileMediaPhotos from './profile-media-photos';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { BAD_REQUEST } from '../../tests/mocks/mock-requests';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { errorExtracter } from '../../utils/error-handler';

describe('Profile media photos', () => {
  it('should correctly renders data in english', async () => {
    renderWithProviders(<ProfileMediaPhotos userId="someUserId" />, { store: mockStore });
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
