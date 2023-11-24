import reducer, {
  PROFILE_INITIAL_STATE,
  saveEmailPassword,
  saveSettingsInfo,
  setIsDisabledWhileSendingProfile,
} from '../../redux/profile/profile';

describe('Profile slice', () => {
  const MOCK_EMAIL_PASSWORD = { email: 'someEmail@yandex.ru', password: 'some password' };
  const MOCK_SETTINGS = {
    gender: 'male',
    name: 'Alexander',
    surname: 'Voronin',
    city: 'Moscow',
    weight: '90',
    bio: "I'm a runner",
    profilePhoto: 'Some photo url',
  };
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(PROFILE_INITIAL_STATE);
  });
  it('should change email password', () => {
    expect(reducer(PROFILE_INITIAL_STATE, saveEmailPassword(MOCK_EMAIL_PASSWORD))).toEqual({
      ...PROFILE_INITIAL_STATE,
      privateInfo: MOCK_EMAIL_PASSWORD,
    });
  });
  it('should change settings', () => {
    expect(reducer(PROFILE_INITIAL_STATE, saveSettingsInfo(MOCK_SETTINGS))).toEqual({
      ...PROFILE_INITIAL_STATE,
      settings: MOCK_SETTINGS,
    });
  });
  it('should change isDisabledWhileSendingProfile', () => {
    expect(reducer(PROFILE_INITIAL_STATE, setIsDisabledWhileSendingProfile(true))).toEqual({
      ...PROFILE_INITIAL_STATE,
      isDisabledWhileSendingProfile: true,
    });
  });
});
