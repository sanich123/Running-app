import { MOCK_EMAIL_PASSWORD, MOCK_SETTINGS } from '@T/mocks/mock-profile-settings';

import { PROFILE_INITIAL_STATE } from './const';
import reducer, {
  resetSettings,
  saveBio,
  saveCity,
  saveEmailPassword,
  saveGender,
  saveName,
  savePhotoUrl,
  saveSurname,
  saveWeight,
  setIsDisabledWhileSendingProfile,
} from './profile';

describe('Profile slice', () => {
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(PROFILE_INITIAL_STATE);
  });
  it('should change email password', () => {
    expect(reducer(PROFILE_INITIAL_STATE, saveEmailPassword(MOCK_EMAIL_PASSWORD))).toEqual({
      ...PROFILE_INITIAL_STATE,
      privateInfo: MOCK_EMAIL_PASSWORD,
    });
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
  it('should change name', () => {
    expect(reducer(PROFILE_INITIAL_STATE, saveName(MOCK_SETTINGS.name))).toEqual({
      ...PROFILE_INITIAL_STATE,
      settings: {
        ...PROFILE_INITIAL_STATE.settings,
        name: MOCK_SETTINGS.name,
      },
    });
  });
  it('should change surname', () => {
    expect(reducer(PROFILE_INITIAL_STATE, saveSurname(MOCK_SETTINGS.surname))).toEqual({
      ...PROFILE_INITIAL_STATE,
      settings: {
        ...PROFILE_INITIAL_STATE.settings,
        surname: MOCK_SETTINGS.surname,
      },
    });
  });
  it('should change weight', () => {
    expect(reducer(PROFILE_INITIAL_STATE, saveWeight(MOCK_SETTINGS.weight))).toEqual({
      ...PROFILE_INITIAL_STATE,
      settings: {
        ...PROFILE_INITIAL_STATE.settings,
        weight: MOCK_SETTINGS.weight,
      },
    });
  });
  it('should change city', () => {
    expect(reducer(PROFILE_INITIAL_STATE, saveCity(MOCK_SETTINGS.city))).toEqual({
      ...PROFILE_INITIAL_STATE,
      settings: {
        ...PROFILE_INITIAL_STATE.settings,
        city: MOCK_SETTINGS.city,
      },
    });
  });
  it('should change bio', () => {
    expect(reducer(PROFILE_INITIAL_STATE, saveBio(MOCK_SETTINGS.bio))).toEqual({
      ...PROFILE_INITIAL_STATE,
      settings: {
        ...PROFILE_INITIAL_STATE.settings,
        bio: MOCK_SETTINGS.bio,
      },
    });
  });
  it('should change gender', () => {
    expect(reducer(PROFILE_INITIAL_STATE, saveGender(MOCK_SETTINGS.gender))).toEqual({
      ...PROFILE_INITIAL_STATE,
      settings: {
        ...PROFILE_INITIAL_STATE.settings,
        gender: MOCK_SETTINGS.gender,
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
          googleInfo: {
            id: '',
            email: '',
            familyName: '',
            givenName: '',
            name: '',
            photo: '',
          },
          isDisabledWhileSendingProfile: false,
          settings: MOCK_SETTINGS,
          isNeedToPrefetchActivities: false,
        },
        resetSettings(),
      ),
    ).toEqual(PROFILE_INITIAL_STATE);
  });
});
