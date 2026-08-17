import { MOCK_SETTINGS } from '@T/mocks/mock-profile-settings';
import { PROFILE_INITIAL_STATE } from './const';
import reducer, { resetSettings, savePhotoUrl, setIsDisabledWhileSendingProfile } from './profile';
import type { ProfileType } from '@S/card/types';

describe('Profile slice', () => {
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: '' })).toEqual(PROFILE_INITIAL_STATE);
  });
  it('should change isDisabledWhileSendingProfile', () => {
    expect(reducer(PROFILE_INITIAL_STATE, setIsDisabledWhileSendingProfile(true))).toEqual({
      ...PROFILE_INITIAL_STATE,
      isDisabledWhileSendingProfile: true,
    });
  });
  it('should change savePhotoUrl', () => {
    expect(reducer(PROFILE_INITIAL_STATE, savePhotoUrl(MOCK_SETTINGS.profilePhoto))).toEqual({
      ...PROFILE_INITIAL_STATE,
      settings: {
        ...PROFILE_INITIAL_STATE.settings,
        profilePhoto: MOCK_SETTINGS.profilePhoto,
      },
    });
  });
  it('should reset settings state', () => {
    expect(
      reducer(
        {
          privateInfo: {
            email: '',
            password: '',
          },
          isDisabledWhileSendingProfile: false,
          settings: { profilePhoto: MOCK_SETTINGS.profilePhoto },
          profileFromServer: {} as ProfileType,
        },
        resetSettings(),
      ),
    ).toEqual(PROFILE_INITIAL_STATE);
  });
});
