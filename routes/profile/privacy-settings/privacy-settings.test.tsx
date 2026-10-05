import { act, fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ProfilePrivacySettings from './privacy-settings';

const mockUpdateProfile = jest.fn();

jest.mock('@R/services/profile/profile', () => ({
  useUpdateProfileByUserIdMutation: () => [mockUpdateProfile, { isLoading: false }],
}));

const defaultSettings = {
  userId: 'owner-id',
  profileSearchVisible: true,
  allowActivityInteractions: true,
  hideActivityStatistics: false,
  hideFollowingList: false,
  hideProfilePhotos: false,
};

describe('ProfilePrivacySettings', () => {
  beforeEach(async () => {
    await act(async () => {
      mockStore.dispatch(changeLanguage(LANGUAGES.english));
    });
    mockUpdateProfile.mockReset();
    mockUpdateProfile.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
  });

  it('shows existing settings with their defaults and exposes the photo privacy option', async () => {
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);
    expect(screen.getByTestId('privacy-setting-profileSearchVisible').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-allowActivityInteractions').props.value).toBe(true);
    expect(screen.getByTestId('privacy-setting-hideActivityStatistics').props.value).toBe(false);
    expect(screen.getByTestId('privacy-setting-hideFollowingList').props.value).toBe(false);
    expect(screen.getByTestId('privacy-setting-hideProfilePhotos').props.value).toBe(false);
  });

  it('saves the profile photo setting through the profile update mutation', async () => {
    await renderWithProviders(<ProfilePrivacySettings {...defaultSettings} />);

    await fireEvent(screen.getByTestId('privacy-setting-hideProfilePhotos'), 'valueChange', true);

    expect(mockUpdateProfile).toHaveBeenCalledWith({ id: 'owner-id', body: { hideProfilePhotos: true } });
  });
});
