import { LANGUAGES } from '@const/enums';
import { profileApi } from '@R/services/profile/profile';
import { setUserId } from '@R/slices/auth/auth';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { mockStore } from '@T/utils/mock-store';
import reducer, {
  addActivityReminder,
  SETTINGS_INITIAL_STATE,
  changeLanguage,
  getActivitySettings,
  setIsProfileFilled,
} from './settings';

describe('Settings slice', () => {
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: '' })).toEqual(SETTINGS_INITIAL_STATE);
  });
  it('should change language', () => {
    expect(reducer(SETTINGS_INITIAL_STATE, changeLanguage(LANGUAGES.russian))).toEqual({
      ...SETTINGS_INITIAL_STATE,
      language: LANGUAGES.russian,
    });
  });
  it('stores whether the profile has been filled', () => {
    expect(reducer(SETTINGS_INITIAL_STATE, setIsProfileFilled(true))).toEqual({
      ...SETTINGS_INITIAL_STATE,
      isProfileFilled: true,
    });
  });
  it('uses defaults when an older persisted settings object has no activity fields', () => {
    expect(getActivitySettings({ language: LANGUAGES.russian, theme: null, isProfileFilled: false })).toMatchObject({
      activityVoiceEnabled: false,
      activityVoiceMetrics: ['pace', 'movingTime', 'elevation'],
      activityVoiceIdentifier: null,
      activityReminderEnabled: false,
      activityReminders: [],
    });
  });
  it('can add a reminder when an older persisted state has no reminders array', () => {
    const olderSettings = {
      ...SETTINGS_INITIAL_STATE,
      activityReminders: undefined,
    } as unknown as typeof SETTINGS_INITIAL_STATE;

    expect(
      reducer(olderSettings, addActivityReminder({ id: 'water-reminder', intervalMinutes: 20, text: 'Вода' })),
    ).toMatchObject({ activityReminders: [{ id: 'water-reminder', intervalMinutes: 20, text: 'Вода' }] });
  });
  it('marks the profile as filled after a successful profile query', async () => {
    mockStore.dispatch(setIsProfileFilled(false));
    mockStore.dispatch(setUserId(MOCK_SERVER_IDS.userId));

    const query = mockStore.dispatch(profileApi.endpoints.getUserProfileByUserId.initiate(MOCK_SERVER_IDS.userId));
    await query.unwrap();

    expect(mockStore.getState().settings.isProfileFilled).toBe(true);
    query.unsubscribe();
  });
});
