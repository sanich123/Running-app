import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import ProfilePrivacyPreview from './profile-privacy-preview';
import { PROFILE_PRIVACY_SETTINGS } from '../../const';

const copy = PROFILE_PRIVACY_SETTINGS[LANGUAGES.russian];

describe('ProfilePrivacyPreview', () => {
  it('shows a profile page preview with all profile sections enabled', async () => {
    await renderWithProviders(
      <ProfilePrivacyPreview
        profileSearchVisible
        allowNewFollowers
        hideActivityStatistics={false}
        hideFollowingList={false}
        hideProfilePhotos={false}
        language={LANGUAGES.russian}
      />,
    );

    expect(screen.getByText(copy.profilePreviewTitle)).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-profile-preview-photos')).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewProfileName)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewCity)).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-profile-preview-avatar-photo').props.source).toBeTruthy();
    expect(screen.getByText(copy.activityPreviewAbout)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewBio)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewFollow)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewStatistics)).toBeOnTheScreen();
    expect(screen.queryByText(copy.activityPreviewPhotosHidden)).not.toBeOnTheScreen();
  });

  it('marks each disabled profile section in the preview', async () => {
    await renderWithProviders(
      <ProfilePrivacyPreview
        profileSearchVisible={false}
        allowNewFollowers={false}
        hideActivityStatistics
        hideFollowingList
        hideProfilePhotos
        language={LANGUAGES.russian}
      />,
    );

    expect(screen.getByText(copy.activityPreviewPhotosHidden)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewProfileSearchDisabled)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewListsHidden)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewFollowingDisabled)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewStatisticsHidden)).toBeOnTheScreen();
  });
});
