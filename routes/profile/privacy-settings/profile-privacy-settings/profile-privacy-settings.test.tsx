import { act, fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import * as MediaLibrary from 'expo-media-library';
import { http, HttpResponse } from 'msw';
import { Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { setSaveCameraPhotosToGallery } from '@R/slices/activity-settings/activity-settings';
import { changeLanguage } from '@R/slices/settings/settings';
import { EMAIL_NOTIFICATIONS_COPY } from '@Routes/settings-page/email-notifications/const';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { PROFILE_PRIVACY_SETTING_SECTIONS, PROFILE_PRIVACY_SETTINGS } from '../const';
import ProfilePrivacySettings from './profile-privacy-settings';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

const originalPlatformOSDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS');
const originalPlatformVersionDescriptor = Object.getOwnPropertyDescriptor(Platform, 'Version');
const englishPrivacyCopy = PROFILE_PRIVACY_SETTINGS[LANGUAGES.english];

const defaultSettings = {
  userId: 'owner-id',
  profileSearchVisible: true,
  allowNewFollowers: true,
  allowActivityInteractions: true,
  allowActivityReplayViewing: true,
  hideActivityStatistics: false,
  hideFollowingList: false,
  hideProfilePhotos: false,
};

describe('ProfilePrivacySettings', () => {
  afterEach(() => {
    if (originalPlatformOSDescriptor) Object.defineProperty(Platform, 'OS', originalPlatformOSDescriptor);
    if (originalPlatformVersionDescriptor)
      Object.defineProperty(Platform, 'Version', originalPlatformVersionDescriptor);
  });

  beforeEach(async () => {
    (MediaLibrary.requestPermissionsAsync as jest.Mock).mockReset().mockResolvedValue({ granted: true });
    await act(async () => {
      mockStore.dispatch(changeLanguage(LANGUAGES.english));
      mockStore.dispatch(setSaveCameraPhotosToGallery(false));
    });
    mockPush.mockReset();
  });

  it('shows existing settings with their defaults and exposes the photo privacy option', async () => {
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);
    expect(screen.getByTestId('privacy-setting-profileSearchVisible').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-allowActivityInteractions').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-allowActivityReplayViewing').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-allowActivityHeartRateViewing').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-allowActivityElevationViewing').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-allowActivityPaceViewing').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-hideActivityStatistics').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-hideFollowingList').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-hideProfilePhotos').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-saveCameraPhotosToGallery').props.value).toBe(false);
    expect(screen.queryByTestId('privacy-setting-emailNotifications')).not.toBeOnTheScreen();
    expect(screen.queryByText(EMAIL_NOTIFICATIONS_COPY[LANGUAGES.english].fullTitle)).not.toBeOnTheScreen();
    expect(MediaLibrary.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(screen.getByText(PROFILE_PRIVACY_SETTINGS[LANGUAGES.english].profileSearchDescription)).toBeOnTheScreen();
  });

  it('groups activity totals under profile privacy', () => {
    const profileSettings = PROFILE_PRIVACY_SETTING_SECTIONS[0].fields;
    const activitySettings = PROFILE_PRIVACY_SETTING_SECTIONS[1].fields;

    expect(profileSettings).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: 'hideActivityStatistics' })]),
    );
    expect(activitySettings).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ key: 'hideActivityStatistics' })]),
    );
  });

  it('requests write-only photo access when enabling gallery saving', async () => {
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await act(async () => {
      fireEvent(screen.getByTestId('privacy-setting-saveCameraPhotosToGallery'), 'valueChange', true);
    });

    expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalledWith(true, ['photo']);
    expect(mockStore.getState().activitySettings.saveCameraPhotosToGallery).toBe(true);
  });

  it('requests write-only storage permission on Android 10', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    Object.defineProperty(Platform, 'Version', { configurable: true, value: 29 });
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await act(async () => {
      fireEvent(screen.getByTestId('privacy-setting-saveCameraPhotosToGallery'), 'valueChange', true);
    });

    expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalledWith(true, ['photo']);
    expect(mockStore.getState().activitySettings.saveCameraPhotosToGallery).toBe(true);
  });

  it('does not request storage permission on Android 11', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    Object.defineProperty(Platform, 'Version', { configurable: true, value: 30 });
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await act(async () => {
      fireEvent(screen.getByTestId('privacy-setting-saveCameraPhotosToGallery'), 'valueChange', true);
    });

    expect(MediaLibrary.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockStore.getState().activitySettings.saveCameraPhotosToGallery).toBe(true);
  });

  it('disables saving camera photos without requesting permission', async () => {
    await act(async () => {
      mockStore.dispatch(setSaveCameraPhotosToGallery(true));
    });
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await act(async () => {
      fireEvent(screen.getByTestId('privacy-setting-saveCameraPhotosToGallery'), 'valueChange', false);
    });

    expect(MediaLibrary.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockStore.getState().activitySettings.saveCameraPhotosToGallery).toBe(false);
  });

  it('keeps gallery saving disabled when write-only photo access is denied', async () => {
    (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await act(async () => {
      fireEvent(screen.getByTestId('privacy-setting-saveCameraPhotosToGallery'), 'valueChange', true);
    });

    expect(mockStore.getState().activitySettings.saveCameraPhotosToGallery).toBe(false);
  });

  it('saves the profile photo viewing preference through the profile update mutation', async () => {
    const updateBodies: unknown[] = [];
    server.use(
      http.patch(`${BASE_URL}/user/owner-id/profile`, async ({ request }) => {
        updateBodies.push(await request.json());
        return HttpResponse.json({});
      }),
    );
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await fireEvent(screen.getByTestId('privacy-setting-hideProfilePhotos'), 'valueChange', false);

    await waitFor(() => expect(updateBodies).toEqual([{ hideProfilePhotos: true }]));
  });

  it('saves whether other users can follow the profile', async () => {
    const updateBodies: unknown[] = [];
    server.use(
      http.patch(`${BASE_URL}/user/owner-id/profile`, async ({ request }) => {
        updateBodies.push(await request.json());
        return HttpResponse.json({});
      }),
    );
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    expect(screen.getByTestId('privacy-setting-allowNewFollowers')).toHaveProp('value', true);
    await fireEvent(screen.getByTestId('privacy-setting-allowNewFollowers'), 'valueChange', false);

    await waitFor(() => expect(updateBodies).toEqual([{ allowNewFollowers: false }]));
  });

  it('saves whether other users can view activity replays', async () => {
    const updateBodies: unknown[] = [];
    server.use(
      http.patch(`${BASE_URL}/user/owner-id/profile`, async ({ request }) => {
        updateBodies.push(await request.json());
        return HttpResponse.json({});
      }),
    );
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await fireEvent(screen.getByTestId('privacy-setting-allowActivityReplayViewing'), 'valueChange', false);

    await waitFor(() => expect(updateBodies).toEqual([{ allowActivityReplayViewing: false }]));
  });

  it('saves each activity chart metric preference independently', async () => {
    const updateBodies: unknown[] = [];
    server.use(
      http.patch(`${BASE_URL}/user/owner-id/profile`, async ({ request }) => {
        updateBodies.push(await request.json());
        return HttpResponse.json({});
      }),
    );
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await fireEvent(screen.getByTestId('privacy-setting-allowActivityHeartRateViewing'), 'valueChange', false);
    await fireEvent(screen.getByTestId('privacy-setting-allowActivityElevationViewing'), 'valueChange', false);
    await fireEvent(screen.getByTestId('privacy-setting-allowActivityPaceViewing'), 'valueChange', false);

    await waitFor(() =>
      expect(updateBodies).toEqual([
        { allowActivityHeartRateViewing: false },
        { allowActivityElevationViewing: false },
        { allowActivityPaceViewing: false },
      ]),
    );
    expect(
      within(screen.getByTestId('privacy-activity-preview-graph')).getByText(
        englishPrivacyCopy.activityPreviewGraphHidden,
      ),
    ).toBeOnTheScreen();
  });
});
