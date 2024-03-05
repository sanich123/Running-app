import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { MOCK_DURATION, MOCK_SPEED, MOCK_DISTANCE } from '@T/mocks/mock-location';
import { MOCK_LOCATIONS } from '@T/mocks/mock-locations';

import reducer, {
  addPhotoUrl,
  resetActivityInfo,
  saveDescription,
  saveEmotion,
  saveFinishedActivity,
  saveIsSwitchOn,
  saveSport,
  saveTitle,
  saveUnsendedActivity,
  setIsDisableWhileSending,
  setIsHaveUnsyncedActivity,
  setIsNeedToResetInputs,
} from './activity';
import { ACTIVITY_INITIAL_STATE } from './const';

describe('Activity slice', () => {
  const MOCK_TITLE = 'Some title';
  const MOCK_DESCRIPTION = 'Some description';
  const MOCK_SPORT = 'Some sport';
  const MOCK_EMOTION = 'Some emotion';
  const MOCK_FINISHED_ACTIVITY = {
    locations: MOCK_LOCATIONS,
    duration: MOCK_DURATION,
    speed: MOCK_SPEED,
    distance: MOCK_DISTANCE,
    kilometresSplit: MOCK_ACTIVITY.kilometresSplit,
  };
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

  // it('should correctly change photoUrls', () => {
  //   const stateWithPhotoUrls = {
  //     ...ACTIVITY_INITIAL_STATE,
  //     additionalInfo: {
  //       ...ACTIVITY_INITIAL_STATE.additionalInfo,
  //       photoVideoUrls: [{ url: 'someUrl', thumbnail: null }],
  //     },
  //   };
  //   expect(reducer(stateWithPhotoUrls, deletePhotoUrl({ url: 'someUrl', thumbnail: null }))).toEqual(
  //     ACTIVITY_INITIAL_STATE,
  //   );
  // });
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
    reducer(ACTIVITY_INITIAL_STATE, addPhotoUrl({ url: 'Some url', thumbnail: null }));
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
  it('should change finishedActivity', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, saveFinishedActivity(MOCK_FINISHED_ACTIVITY))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      finishedActivity: MOCK_FINISHED_ACTIVITY,
    });
  });
});
