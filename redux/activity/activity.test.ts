import reducer, {
  ACTIVITY_INITIAL_STATE,
  resetActivityInfo,
  saveDescription,
  saveEmotion,
  saveIsSwitchOn,
  savePhotoUrls,
  saveSport,
  saveTitle,
  saveUnsendedActivity,
  setIsDisableWhileSending,
  setIsHaveUnsyncedActivity,
  setIsNeedToResetInputs,
} from './activity';
import { MOCK_ACTIVITY } from '../../tests/mocks/mock-activity';

describe('Activity slice', () => {
  const PHOTO_URLS = ['someUrl1', 'someUrl2'];
  const MOCK_TITLE = 'Some title';
  const MOCK_DESCRIPTION = 'Some description';
  const MOCK_SPORT = 'Some sport';
  const MOCK_EMOTION = 'Some emotion';
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(ACTIVITY_INITIAL_STATE);
  });
  it('should correctly change title', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, saveTitle(MOCK_TITLE))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      additionalInfo: {
        ...ACTIVITY_INITIAL_STATE.additionalInfo,
        title: MOCK_TITLE,
      },
    });
  });
  it('should correctly change description', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, saveDescription(MOCK_DESCRIPTION))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      additionalInfo: {
        ...ACTIVITY_INITIAL_STATE.additionalInfo,
        description: MOCK_DESCRIPTION,
      },
    });
  });
  it('should correctly change sport', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, saveSport(MOCK_SPORT))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      additionalInfo: {
        ...ACTIVITY_INITIAL_STATE.additionalInfo,
        sport: MOCK_SPORT,
      },
    });
  });
  it('should correctly change emotion', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, saveEmotion(MOCK_EMOTION))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      additionalInfo: {
        ...ACTIVITY_INITIAL_STATE.additionalInfo,
        emotion: MOCK_EMOTION,
      },
    });
  });
  it('should correctly change isSwitchOn', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, saveIsSwitchOn(true))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      additionalInfo: {
        ...ACTIVITY_INITIAL_STATE.additionalInfo,
        isSwitchOn: true,
      },
    });
  });
  it('should correctly change photoUrls', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, savePhotoUrls(PHOTO_URLS))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      additionalInfo: {
        ...ACTIVITY_INITIAL_STATE.additionalInfo,
        photoUrls: PHOTO_URLS,
      },
    });
  });
  it('should correctly change isDisableWhileSending', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, setIsDisableWhileSending(true))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      isDisabledWhileSending: true,
    });
  });
  it('should correctly change isNeedToResetInputs', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, setIsNeedToResetInputs(true))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      isNeedToResetInputs: true,
    });
  });
  it('should correctly reset activity info', () => {
    reducer(ACTIVITY_INITIAL_STATE, saveTitle(MOCK_TITLE));
    reducer(ACTIVITY_INITIAL_STATE, setIsNeedToResetInputs(true));
    reducer(ACTIVITY_INITIAL_STATE, setIsDisableWhileSending(true));
    reducer(ACTIVITY_INITIAL_STATE, savePhotoUrls(PHOTO_URLS));
    reducer(ACTIVITY_INITIAL_STATE, saveIsSwitchOn(true));
    reducer(ACTIVITY_INITIAL_STATE, saveEmotion(MOCK_EMOTION));
    reducer(ACTIVITY_INITIAL_STATE, saveSport(MOCK_SPORT));
    reducer(ACTIVITY_INITIAL_STATE, saveDescription(MOCK_DESCRIPTION));
    expect(reducer(ACTIVITY_INITIAL_STATE, resetActivityInfo())).toEqual(ACTIVITY_INITIAL_STATE);
  });
  it('should correctly save unsendedActivity', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, saveUnsendedActivity(MOCK_ACTIVITY))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      unsyncedActivities: [MOCK_ACTIVITY],
    });
  });
  it('should change isHaveUnsyncedActivity flag', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, setIsHaveUnsyncedActivity(true))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      isHaveUnsyncedActivity: true,
    });
  });
  it('should correctly refresh unsynced activities list', () => {
    const state = reducer(ACTIVITY_INITIAL_STATE, saveUnsendedActivity(MOCK_ACTIVITY));
    expect(reducer(state, saveUnsendedActivity(MOCK_ACTIVITY))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      unsyncedActivities: [MOCK_ACTIVITY, MOCK_ACTIVITY],
    });
  });
});
