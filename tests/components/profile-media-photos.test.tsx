import { screen } from '@testing-library/react-native';

import { PROFILE_MEDIA } from '../../components/profile-media-photos/const';
import ProfileMediaPhotos from '../../components/profile-media-photos/profile-media-photos';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { errorExtracter } from '../../utils/error-handler';
import { BAD_REQUEST } from '../mocks/mock-requests';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

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
