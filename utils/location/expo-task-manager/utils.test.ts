import { SPORTS_BTNS_VALUES } from '@const/sports';
import { saveSport } from '@R/slices/actitivity-additional-info/activity-additional-info';
import { resetLocationSlice } from '@R/slices/location/location';
import { store } from '@R/store';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import { getSpeedInKmPerHour } from '../location-utils';
import { saveMetricsToStoreTaskManager } from './utils';

describe('location speed filtering', () => {
  beforeEach(() => {
    store.dispatch(resetLocationSlice());
  });

  it('calculates speed in kilometres per hour', () => {
    expect(getSpeedInKmPerHour(1000, 60_000)).toBe(60);
  });

  it('skips an implausibly fast running location', () => {
    store.dispatch(saveSport(SPORTS_BTNS_VALUES.run));

    saveMetricsToStoreTaskManager(0, MOCK_LOCATION, 60_000, 0, 0, 1000);

    expect(store.getState().location.locationsFromBackground).toEqual([]);
    expect(store.getState().location.isTooMuchSpeed).toBe(true);
    expect(store.getState().location.tooMuchSpeed).toBe(60);
  });

  it('accepts a realistic cycling location at the same distance', () => {
    store.dispatch(saveSport(SPORTS_BTNS_VALUES.bike));

    saveMetricsToStoreTaskManager(0, MOCK_LOCATION, 90_000, 0, 0, 1000);

    expect(store.getState().location.locationsFromBackground).toHaveLength(1);
    expect(store.getState().location.isTooMuchSpeed).toBe(false);
  });
});
