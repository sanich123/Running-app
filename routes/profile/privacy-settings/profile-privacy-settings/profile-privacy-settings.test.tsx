import { act, fireEvent, screen } from '@testing-library/react-native';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage, setSaveCameraPhotosToGallery } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ProfilePrivacySettings from './profile-privacy-settings';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

const mockUpdateProfile = jest.fn();
const originalPlatformOSDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS');
const originalPlatformVersionDescriptor = Object.getOwnPropertyDescriptor(Platform, 'Version');

jest.mock('@R/services/profile/profile', () => ({
  useUpdateProfileByUserIdMutation: () => [mockUpdateProfile, { isLoading: false }],
}));

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
    mockUpdateProfile.mockReset();
    mockPush.mockReset();
    mockUpdateProfile.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
  });

  it('shows existing settings with their defaults and exposes the photo privacy option', async () => {
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);
    expect(screen.getByTestId('privacy-setting-profileSearchVisible').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-allowActivityInteractions').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-allowActivityReplayViewing').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-hideActivityStatistics').props.value).toBe(false);
    expect(screen.getByTestId('privacy-setting-hideFollowingList').props.value).toBe(false);
    expect(screen.getByTestId('privacy-setting-hideProfilePhotos').props.value).toBe(false);
    expect(screen.getByTestId('privacy-setting-saveCameraPhotosToGallery').props.value).toBe(false);
    expect(screen.queryByTestId('privacy-setting-emailNotifications')).not.toBeOnTheScreen();
    expect(screen.queryByText('Email notifications')).not.toBeOnTheScreen();
    expect(MediaLibrary.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(screen.getByText('When disabled, other users cannot find your profile through search.')).toBeOnTheScreen();
  });

  it('requests write-only photo access when enabling gallery saving', async () => {
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await act(async () => {
      fireEvent(screen.getByTestId('privacy-setting-saveCameraPhotosToGallery'), 'valueChange', true);
    });

    expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalledWith(true, ['photo']);
    expect(mockStore.getState().settings.saveCameraPhotosToGallery).toBe(true);
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('requests write-only storage permission on Android 10', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    Object.defineProperty(Platform, 'Version', { configurable: true, value: 29 });
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await act(async () => {
      fireEvent(screen.getByTestId('privacy-setting-saveCameraPhotosToGallery'), 'valueChange', true);
    });

    expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalledWith(true, ['photo']);
    expect(mockStore.getState().settings.saveCameraPhotosToGallery).toBe(true);
  });

  it('does not request storage permission on Android 11', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    Object.defineProperty(Platform, 'Version', { configurable: true, value: 30 });
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await act(async () => {
      fireEvent(screen.getByTestId('privacy-setting-saveCameraPhotosToGallery'), 'valueChange', true);
    });

    expect(MediaLibrary.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockStore.getState().settings.saveCameraPhotosToGallery).toBe(true);
  });

  it('keeps gallery saving disabled when write-only photo access is denied', async () => {
    (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await act(async () => {
      fireEvent(screen.getByTestId('privacy-setting-saveCameraPhotosToGallery'), 'valueChange', true);
    });

    expect(mockStore.getState().settings.saveCameraPhotosToGallery).toBe(false);
  });

  it('saves the profile photo setting through the profile update mutation', async () => {
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await fireEvent(screen.getByTestId('privacy-setting-hideProfilePhotos'), 'valueChange', true);

    expect(mockUpdateProfile).toHaveBeenCalledWith({ id: 'owner-id', body: { hideProfilePhotos: true } });
  });

  it('saves whether other users can follow the profile', async () => {
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    expect(screen.getByTestId('privacy-setting-allowNewFollowers')).toHaveProp('value', true);
    await fireEvent(screen.getByTestId('privacy-setting-allowNewFollowers'), 'valueChange', false);

    expect(mockUpdateProfile).toHaveBeenCalledWith({ id: 'owner-id', body: { allowNewFollowers: false } });
  });

  it('saves whether other users can view activity replays', async () => {
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await fireEvent(screen.getByTestId('privacy-setting-allowActivityReplayViewing'), 'valueChange', false);

    expect(mockUpdateProfile).toHaveBeenCalledWith({ id: 'owner-id', body: { allowActivityReplayViewing: false } });
  });
});
