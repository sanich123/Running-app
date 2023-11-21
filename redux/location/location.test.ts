import reducer, {
  LOCATION_INITIAL_STATE,
  addDurationAndLocationToKmSplits,
  resetLocationsFromBackground,
  setActivityStatus,
  setAltitude,
  setCurrentPace,
  setDistance,
  setDuration,
  setDurationWithPauses,
  setEmptyLastArrayWhenPaused,
  setInitialLocation,
  setIsAppShuted,
  setIsMapVisible,
  setIsTooMuchSpeed,
  setLastKm,
  setLastKmAltitude,
  setLastKmDuration,
  setLastPosition,
  setLocationsFromBackground,
  setLocationsWhenContinued,
} from './location';
import { STATUSES } from '../../constants/enums';
import {
  MOCK_ALTITUDE,
  MOCK_DISTANCE,
  MOCK_DURATION,
  MOCK_LOCATION,
  MOCK_SPEED,
} from '../../tests/mocks/mock-location';
import { mockStore } from '../../tests/utils/mock-store';

describe('Location slice', () => {
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(LOCATION_INITIAL_STATE);
  });
  it('should change initialLocation', () => {
    expect(reducer(LOCATION_INITIAL_STATE, setInitialLocation(MOCK_LOCATION))).toEqual({
      ...LOCATION_INITIAL_STATE,
      initialLocation: MOCK_LOCATION,
    });
  });

  it('should change locationsFromBackground', () => {
    expect(reducer(LOCATION_INITIAL_STATE, setLocationsFromBackground(MOCK_LOCATION))).toEqual({
      ...LOCATION_INITIAL_STATE,
      locationsFromBackground: [MOCK_LOCATION],
    });
  });
  it('should change total distance', () => {
    expect(reducer(LOCATION_INITIAL_STATE, setDistance(MOCK_DISTANCE))).toEqual({
      ...LOCATION_INITIAL_STATE,
      distance: MOCK_DISTANCE,
    });
  });
  it('should change total duration', () => {
    expect(reducer(LOCATION_INITIAL_STATE, setDuration(MOCK_DURATION))).toEqual({
      ...LOCATION_INITIAL_STATE,
      duration: MOCK_DURATION,
    });
  });
  it('should change duration with pauses', () => {
    expect(reducer(LOCATION_INITIAL_STATE, setDurationWithPauses(MOCK_DURATION))).toEqual({
      ...LOCATION_INITIAL_STATE,
      durationWithPauses: MOCK_DURATION,
    });
  });
  it('should change altitude', () => {
    expect(reducer(LOCATION_INITIAL_STATE, setAltitude(MOCK_ALTITUDE))).toEqual({
      ...LOCATION_INITIAL_STATE,
      altitude: MOCK_ALTITUDE,
    });
  });
  it('should change lastKmAltitude', () => {
    expect(reducer(LOCATION_INITIAL_STATE, setLastKmAltitude(MOCK_ALTITUDE))).toEqual({
      ...LOCATION_INITIAL_STATE,
      lastKilometerAltitude: MOCK_ALTITUDE,
    });
  });
  it('should change activity status', () => {
    expect(reducer(LOCATION_INITIAL_STATE, setActivityStatus(STATUSES.started))).toEqual({
      ...LOCATION_INITIAL_STATE,
      activityStatus: STATUSES.started,
    });
  });
  it('should change last km', () => {
    expect(reducer(LOCATION_INITIAL_STATE, setLastKm(MOCK_DISTANCE))).toEqual({
      ...LOCATION_INITIAL_STATE,
      lastKilometer: MOCK_DISTANCE,
    });
  });
  it('should change last km duration', () => {
    expect(reducer(LOCATION_INITIAL_STATE, setLastKmDuration(MOCK_DURATION))).toEqual({
      ...LOCATION_INITIAL_STATE,
      lastKilometerDuration: MOCK_DURATION,
    });
  });
  it('should add duration and location to km splits', () => {
    expect(reducer(LOCATION_INITIAL_STATE, addDurationAndLocationToKmSplits(MOCK_LOCATION))).toEqual({
      ...LOCATION_INITIAL_STATE,
      kilometresSplit: [
        {
          lastKilometerDuration: LOCATION_INITIAL_STATE.lastKilometerDuration,
          lastKilometerAltitude: LOCATION_INITIAL_STATE.lastKilometerAltitude,
          kilometerPoint: MOCK_LOCATION,
        },
      ],
    });
  });
  it('should change, when app is shuted by phone', () => {
    expect(reducer(LOCATION_INITIAL_STATE, setIsAppShuted(true))).toEqual({
      ...LOCATION_INITIAL_STATE,
      isAppShutedByPhone: true,
    });
  });
  it('should change is map visible', () => {
    expect(reducer(LOCATION_INITIAL_STATE, setIsMapVisible(true))).toEqual({
      ...LOCATION_INITIAL_STATE,
      isMapVisible: true,
    });
  });
  it('should add an empty array to the last position, when paused', () => {
    reducer(LOCATION_INITIAL_STATE, setLocationsWhenContinued(MOCK_LOCATION));
    reducer(LOCATION_INITIAL_STATE, setLocationsWhenContinued(MOCK_LOCATION));
    expect(reducer(LOCATION_INITIAL_STATE, setEmptyLastArrayWhenPaused())).toEqual({
      ...LOCATION_INITIAL_STATE,
      locationsWithPauses: [[], []],
    });
  });
  it('should add a position to the last array', () => {
    mockStore.dispatch(setLocationsWhenContinued(MOCK_LOCATION));
    expect(reducer(mockStore.getState().location, setEmptyLastArrayWhenPaused())).toEqual({
      ...LOCATION_INITIAL_STATE,
      locationsWithPauses: [[MOCK_LOCATION], []],
    });
  });
  it('should change a last position', () => {
    expect(reducer(mockStore.getState().location, setLastPosition(MOCK_LOCATION))).toEqual({
      ...mockStore.getState().location,
      lastPosition: MOCK_LOCATION,
    });
  });
  it('should change isTooMuchSpeed', () => {
    expect(reducer(LOCATION_INITIAL_STATE, setIsTooMuchSpeed(true))).toEqual({
      ...LOCATION_INITIAL_STATE,
      isTooMuchSpeed: true,
    });
  });
  it('should correctly reset locations from background', () => {
    mockStore.dispatch(setLocationsFromBackground(MOCK_LOCATION));
    mockStore.dispatch(setDuration(MOCK_DURATION));
    mockStore.dispatch(setDistance(MOCK_DISTANCE));
    mockStore.dispatch(setAltitude(MOCK_ALTITUDE));
    mockStore.dispatch(addDurationAndLocationToKmSplits(MOCK_LOCATION));
    mockStore.dispatch(setCurrentPace(MOCK_SPEED));
    mockStore.dispatch(setLocationsWhenContinued(MOCK_LOCATION));
    mockStore.dispatch(setLocationsWhenContinued(MOCK_LOCATION));
    mockStore.dispatch(setLocationsWhenContinued(MOCK_LOCATION));
    mockStore.dispatch(resetLocationsFromBackground());
    expect(mockStore.getState().location.locationsFromBackground).toEqual([]);
    expect(mockStore.getState().location.duration).toEqual(0);
    expect(mockStore.getState().location.distance).toEqual(0);
    expect(mockStore.getState().location.altitude).toEqual(0);
    expect(mockStore.getState().location.kilometresSplit).toEqual([]);
    expect(mockStore.getState().location.currentPace).toEqual(0);
    expect(mockStore.getState().location.locationsWithPauses).toEqual([]);
  });
});
