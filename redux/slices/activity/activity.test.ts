import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { MOCK_DURATION, MOCK_SPEED, MOCK_DISTANCE } from '@T/mocks/mock-location';
import { MOCK_LOCATIONS } from '@T/mocks/mock-locations';
import reducer, { saveFinishedActivity, setIsDisableWhileSending } from './activity';
import { ACTIVITY_INITIAL_STATE } from './const';

describe('Activity slice', () => {
  const MOCK_FINISHED_ACTIVITY = {
    locations: MOCK_LOCATIONS,
    duration: MOCK_DURATION,
    speed: MOCK_SPEED,
    distance: MOCK_DISTANCE,
    kilometresSplit: MOCK_ACTIVITY.kilometresSplit,
  };
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: '' })).toEqual(ACTIVITY_INITIAL_STATE);
  });

  it('should correctly change isDisableWhileSending', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, setIsDisableWhileSending(true))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      isDisabledWhileSending: true,
    });
  });

  it('should change finishedActivity', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, saveFinishedActivity(MOCK_FINISHED_ACTIVITY))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      finishedActivity: MOCK_FINISHED_ACTIVITY,
    });
  });
});
