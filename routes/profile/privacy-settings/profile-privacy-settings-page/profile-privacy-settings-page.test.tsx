import { screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { MOCK_SERVER_IDS, MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ProfilePrivacySettingsPage from './profile-privacy-settings-page';

describe('ProfilePrivacySettingsPage', () => {
  beforeEach(() => mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId)));

  it('loads the current profile settings and renders each privacy switch', async () => {
    server.use(
      http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, () =>
        HttpResponse.json({
          ...MOCK_SERVER_PROFILE,
          profileSearchVisible: false,
          allowNewFollowers: false,
          allowActivityInteractions: true,
          allowActivityReplayViewing: false,
          allowActivityHeartRateViewing: false,
          allowActivityElevationViewing: true,
          allowActivityPaceViewing: false,
          hideActivityStatistics: true,
          hideFollowingList: false,
          hideProfilePhotos: true,
        }),
      ),
    );

    await renderWithProviders(<ProfilePrivacySettingsPage />);

    expect(await screen.findByTestId('privacy-setting-profileSearchVisible')).toHaveProp('value', false);
    expect(screen.getByTestId('privacy-setting-allowNewFollowers')).toHaveProp('value', false);
    expect(screen.getByTestId('privacy-setting-allowActivityInteractions')).toHaveProp('value', true);
    expect(screen.getByTestId('privacy-setting-allowActivityReplayViewing')).toHaveProp('value', false);
    expect(screen.getByTestId('privacy-setting-allowActivityHeartRateViewing')).toHaveProp('value', false);
    expect(screen.getByTestId('privacy-setting-allowActivityElevationViewing')).toHaveProp('value', true);
    expect(screen.getByTestId('privacy-setting-allowActivityPaceViewing')).toHaveProp('value', false);
    expect(screen.getByTestId('privacy-setting-hideActivityStatistics')).toHaveProp('value', false);
    expect(screen.getByTestId('privacy-setting-hideFollowingList')).toHaveProp('value', true);
    expect(screen.getByTestId('privacy-setting-hideProfilePhotos')).toHaveProp('value', false);
  });
});
