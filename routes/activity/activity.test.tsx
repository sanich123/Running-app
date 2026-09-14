import { screen, waitFor } from '@testing-library/react-native';
import { STATUSES } from '@const/enums';
import { setActivityStatus, setIsMapVisible } from '@R/slices/location/location';
import {
  clearTrackingRecovery,
  setTrackingRecoveryStatus,
  startTrackingRecovery,
} from '@R/slices/tracking-recovery/tracking-recovery';
import * as errorToastModule from '@S/error-toast/error-toast';
import { mockStore, resetMockLocation } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import * as backgroundLocation from '@U/location/expo-task-manager/background-location';
import { createLocationJournal } from '@U/location/location-journal';
import Activity from './activity';

jest.mock('@Routes/activity/icon-choose-sport/icon-choose-sport', () => ({
  __esModule: true,
  default: () => {
    const { View, Text } = require('react-native');
    return (
      <View testID="activity-sport-picker">
        <Text>sport-picker</Text>
      </View>
    );
  },
}));
jest.mock('@Routes/activity/map/map', () => ({
  __esModule: true,
  default: function ActivityMapMock({
    onLocationReadinessChange,
  }: {
    onLocationReadinessChange: (value: boolean) => void;
  }) {
    const React = require('react');
    const { View, Text } = require('react-native');
    React.useEffect(() => onLocationReadinessChange(true), [onLocationReadinessChange]);
    return (
      <View testID="activity-map">
        <Text>map</Text>
      </View>
    );
  },
}));
jest.mock('@Routes/activity/metrics/metrics', () => ({
  __esModule: true,
  default: () => {
    const { View, Text } = require('react-native');
    return (
      <View testID="activity-metrics">
        <Text>metrics</Text>
      </View>
    );
  },
}));
jest.mock('@Routes/activity/pause-btn/pause-btn', () => ({
  __esModule: true,
  default: () => {
    const { View, Text } = require('react-native');
    return (
      <View testID="activity-pause">
        <Text>pause</Text>
      </View>
    );
  },
}));
jest.mock('@Routes/activity/show-map-btn/show-map-btn', () => ({
  __esModule: true,
  default: () => {
    const { View, Text } = require('react-native');
    return (
      <View testID="activity-show-map">
        <Text>show-map</Text>
      </View>
    );
  },
}));
jest.mock('@Routes/activity/start-btn/start-btn', () => ({
  __esModule: true,
  default: ({ isReadyToRecordLocation }: { isReadyToRecordLocation: boolean }) => {
    const { View, Text } = require('react-native');
    return (
      <View testID={`activity-start-${isReadyToRecordLocation ? 'ready' : 'waiting'}`}>
        <Text>start</Text>
      </View>
    );
  },
}));

describe('Activity', () => {
  let mockStopLocationTracking: jest.SpiedFunction<typeof backgroundLocation.stopLocationTracking>;
  let mockErrorToast: jest.SpiedFunction<typeof errorToastModule.errorToast>;

  beforeEach(() => {
    mockStore.dispatch(resetMockLocation());
    mockStore.dispatch(clearTrackingRecovery());
    mockStopLocationTracking = jest.spyOn(backgroundLocation, 'stopLocationTracking').mockResolvedValue(undefined);
    mockErrorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
  });

  it('renders the initial activity controls and waits for the map to be ready', async () => {
    await renderWithProviders(<Activity />);

    expect(screen.getByTestId('activity-map')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-sport-picker')).toBeOnTheScreen();
    expect(screen.queryByTestId('activity-metrics')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('activity-pause')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('activity-show-map')).not.toBeOnTheScreen();
    expect(await screen.findByTestId('activity-start-ready')).toBeOnTheScreen();
  });

  it.each([
    [STATUSES.started, false],
    [STATUSES.continued, false],
    [STATUSES.paused, true],
  ])('renders the controls for %s status', async (status, shouldShowPause) => {
    if (status !== STATUSES.paused) {
      mockStopLocationTracking.mockImplementation(() => new Promise(() => {}));
    }
    mockStore.dispatch(setActivityStatus(status));
    await renderWithProviders(<Activity />);

    expect(screen.getByTestId('activity-metrics')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-start-ready')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-show-map')).toBeOnTheScreen();
    expect(screen.queryByTestId('choose-activity-sport')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('activity-sport-picker')).not.toBeOnTheScreen();
    if (shouldShowPause) {
      expect(screen.getByTestId('activity-pause')).toBeOnTheScreen();
    } else {
      expect(screen.queryByTestId('activity-pause')).not.toBeOnTheScreen();
    }
  });

  it('keeps the map mounted when it is hidden during an active activity', async () => {
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    mockStore.dispatch(setIsMapVisible(false));
    await renderWithProviders(<Activity />);

    expect(screen.getByTestId('activity-map')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-metrics')).toBeOnTheScreen();
  });

  it('pauses recovered tracking only after stopping the location service', async () => {
    mockStore.dispatch(startTrackingRecovery(createLocationJournal()));
    await renderWithProviders(<Activity />);

    await waitFor(() => expect(mockStopLocationTracking).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      expect(mockStore.getState().location.activityStatus).toBe(STATUSES.paused);
      expect(mockStore.getState().location.isAppShutedByPhone).toBe(true);
    });
    await waitFor(() => expect(mockStore.getState().location.locationsWithPauses).toHaveLength(2));
  });

  it('keeps recovered tracking active and reports an error when stopping fails', async () => {
    const error = new Error('stop failed');
    mockStopLocationTracking.mockRejectedValueOnce(error);
    mockStore.dispatch(startTrackingRecovery(createLocationJournal()));
    mockStore.dispatch(setTrackingRecoveryStatus(STATUSES.continued));

    await renderWithProviders(<Activity />);

    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith('Не удалось поставить отслеживание на паузу', error),
    );
    expect(mockStore.getState().location.activityStatus).toBe(STATUSES.continued);
    expect(mockStore.getState().location.isAppShutedByPhone).toBe(false);
  });
});
