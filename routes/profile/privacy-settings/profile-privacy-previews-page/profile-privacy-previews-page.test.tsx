import { screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { MOCK_SERVER_IDS, MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { PROFILE_PRIVACY_SETTINGS } from '../const';
import ProfilePrivacyPreviewsPage from './profile-privacy-previews-page';

describe('ProfilePrivacyPreviewsPage', () => {
  beforeEach(() => mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId)));

  it('shows profile and activity previews using the saved privacy settings', async () => {
    server.use(
      http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, () =>
        HttpResponse.json({
          ...MOCK_SERVER_PROFILE,
          profileSearchVisible: false,
          allowNewFollowers: false,
          allowActivityReplayViewing: false,
          allowActivityHeartRateViewing: false,
          allowActivityElevationViewing: false,
          allowActivityPaceViewing: false,
          hideProfilePhotos: true,
        }),
      ),
    );

    await renderWithProviders(<ProfilePrivacyPreviewsPage />);

    expect(await screen.findByTestId('privacy-profile-preview-search')).toBeOnTheScreen();
    expect(screen.getByText(PROFILE_PRIVACY_SETTINGS[LANGUAGES.russian].activityPreviewPhotosHidden)).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-map-hidden')).toBeOnTheScreen();
    expect(screen.getByText(PROFILE_PRIVACY_SETTINGS[LANGUAGES.russian].activityPreviewGraphHidden)).toBeOnTheScreen();
  });
});
