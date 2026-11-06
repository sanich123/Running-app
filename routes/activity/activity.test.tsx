import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import * as Speech from 'expo-speech';
import { StyleSheet } from 'react-native';
import { LANGUAGES, STATUSES } from '@const/enums';
import {
  setNavigationAlertRepeatIntervalMinutes,
  setNavigationAlertsMuted,
} from '@R/slices/activity-settings/activity-settings';
import { DEFAULT_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES } from '@R/slices/activity-settings/types';
import { setActivityStatus, setLastPosition, setNavigationTrackId } from '@R/slices/location/location';
import { changeLanguage } from '@R/slices/settings/settings';
import {
  clearTrackingRecovery,
  setTrackingRecoveryStatus,
  startTrackingRecovery,
} from '@R/slices/tracking-recovery/tracking-recovery';
import * as errorToastModule from '@S/error-toast/error-toast';
import { mockStore, resetMockLocation } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import * as activityTrackLibrary from '@U/activity-track/track-library';
import * as backgroundLocation from '@U/location/expo-task-manager/background-location';
import { createLocationJournal } from '@U/location/location-journal';
import Activity from './activity';
import { ACTIVITY_TRACKING_ERROR_COPY } from './const';
import { ACTIVITY_SHOW_MAP_TEST_ID } from './show-map-btn/const';

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useGlobalSearchParams: () => ({ sport: 'run' }),
}));

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
    const { Pressable, View, Text } = require('react-native');
    const ActivityNavigationContext = require('./navigation-context').default;
    const navigation = React.useContext(ActivityNavigationContext);
    React.useEffect(() => onLocationReadinessChange(true), [onLocationReadinessChange]);
    return (
      <View testID="activity-map">
        <Text>map</Text>
        <Pressable testID="activity-start-navigation" onPress={() => navigation?.onToggleNavigationActive()} />
        <Pressable
          testID="activity-open-offline-map-download"
          onPress={() =>
            navigation?.onDownloadOfflineMap(
              [
                [38, 56],
                [37, 55],
              ],
              [37.5, 55.5],
            )
          }
        />
      </View>
    );
  },
}));
jest.mock('@Routes/maps-page/offline-maps-tab/map-region-downloader/map-region-downloader', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => React.createElement(View, { testID: 'activity-offline-map-downloader' }) };
});
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
  let mockDateNow: jest.SpiedFunction<typeof Date.now> | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(resetMockLocation());
    mockStore.dispatch(clearTrackingRecovery());
    mockStore.dispatch(setNavigationAlertRepeatIntervalMinutes(DEFAULT_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES));
    mockStore.dispatch(setNavigationAlertsMuted(false));
    mockStopLocationTracking = jest.spyOn(backgroundLocation, 'stopLocationTracking').mockResolvedValue(undefined);
    mockErrorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
  });

  afterEach(() => {
    mockDateNow?.mockRestore();
    mockDateNow = null;
  });

  async function startNavigation() {
    const user = userEvent.setup();
    await user.press(await screen.findByTestId('activity-start-navigation'));
  }

  it('renders the initial activity controls and waits for the map to be ready', async () => {
    await renderWithProviders(<Activity />);

    expect(screen.getByTestId('activity-map')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-sport-picker')).toBeOnTheScreen();
    expect(screen.queryByTestId('activity-metrics')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('activity-pause')).not.toBeOnTheScreen();
    expect(screen.queryByTestId(ACTIVITY_SHOW_MAP_TEST_ID)).not.toBeOnTheScreen();
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
    expect(screen.getByTestId(ACTIVITY_SHOW_MAP_TEST_ID)).toBeOnTheScreen();
    expect(screen.queryByTestId('choose-activity-sport')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('activity-sport-picker')).not.toBeOnTheScreen();
    if (shouldShowPause) {
      expect(screen.getByTestId('activity-pause')).toBeOnTheScreen();
    } else {
      expect(screen.queryByTestId('activity-pause')).not.toBeOnTheScreen();
    }
  });

  it('keeps the map mounted when it is hidden during an active activity', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<Activity />);

    expect(screen.getByTestId('activity-map')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-metrics')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-map-layer').props.pointerEvents).toBe('auto');

    await user.press(screen.getByTestId(ACTIVITY_SHOW_MAP_TEST_ID));

    const hiddenMapLayer = screen.getByTestId('activity-map-layer');
    expect(hiddenMapLayer.props.pointerEvents).toBe('none');
    expect(StyleSheet.flatten(hiddenMapLayer.props.style)).toEqual(expect.objectContaining({ opacity: 0 }));
    expect(screen.getByTestId('activity-map')).toBeOnTheScreen();
  });

  it('opens the offline map downloader from the route map controls', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<Activity />);

    await user.press(screen.getByTestId('activity-open-offline-map-download'));

    expect(screen.getByTestId('activity-offline-map-downloader')).toBeOnTheScreen();
  });

  it.each([
    {
      language: LANGUAGES.russian,
      locale: 'ru-RU',
      text: 'Вы находитесь примерно в 110 метрах от маршрута.',
    },
    {
      language: LANGUAGES.english,
      locale: 'en-US',
      text: 'You are about 110 metres from the route.',
    },
  ])('speaks once for confident route deviation in $language', async ({ language, locale, text }) => {
    jest
      .spyOn(activityTrackLibrary, 'readSavedActivityTrack')
      .mockResolvedValue([{ coords: { latitude: 0, longitude: 0 } }, { coords: { latitude: 0, longitude: 0.001 } }]);
    mockStore.dispatch(changeLanguage(language));
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    mockStore.dispatch(setNavigationTrackId('saved-route'));
    mockStore.dispatch(
      setLastPosition({
        timestamp: 1000,
        coords: {
          latitude: 0.001,
          longitude: 0.0005,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
      }),
    );

    await renderWithProviders(<Activity />);
    await startNavigation();

    await waitFor(() => expect(Speech.speak).toHaveBeenCalledWith(text, expect.objectContaining({ language: locale })));
    expect(Speech.speak).toHaveBeenCalledTimes(1);
  });

  it('does not speak when location accuracy is too low for route guidance', async () => {
    jest
      .spyOn(activityTrackLibrary, 'readSavedActivityTrack')
      .mockResolvedValue([{ coords: { latitude: 0, longitude: 0 } }, { coords: { latitude: 0, longitude: 0.001 } }]);
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    mockStore.dispatch(setNavigationTrackId('saved-route'));
    mockStore.dispatch(
      setLastPosition({
        timestamp: 1000,
        coords: {
          latitude: 0.001,
          longitude: 0.0005,
          accuracy: 40,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
      }),
    );

    await renderWithProviders(<Activity />);
    await startNavigation();

    await waitFor(() => expect(screen.getByTestId('activity-map')).toBeOnTheScreen());
    expect(Speech.speak).not.toHaveBeenCalled();
  });

  it('waits for a fresh GPS location before speaking while navigation is not recording', async () => {
    jest
      .spyOn(activityTrackLibrary, 'readSavedActivityTrack')
      .mockResolvedValue([{ coords: { latitude: 0, longitude: 0 } }, { coords: { latitude: 0, longitude: 0.001 } }]);
    mockStore.dispatch(setNavigationTrackId('saved-route'));
    mockStore.dispatch(
      setLastPosition({
        timestamp: 1000,
        coords: {
          latitude: 0.001,
          longitude: 0.0005,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
      }),
    );

    await renderWithProviders(<Activity />);
    await startNavigation();

    await waitFor(() => expect(screen.getByTestId('activity-map')).toBeOnTheScreen());
    expect(Speech.speak).not.toHaveBeenCalled();
  });

  it('speaks for an accurate simulated location in the iOS simulator', async () => {
    jest
      .spyOn(activityTrackLibrary, 'readSavedActivityTrack')
      .mockResolvedValue([{ coords: { latitude: 0, longitude: 0 } }, { coords: { latitude: 0, longitude: 0.001 } }]);
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    mockStore.dispatch(setNavigationTrackId('saved-route'));
    mockStore.dispatch(
      setLastPosition({
        timestamp: 1000,
        mocked: true,
        coords: {
          latitude: 0.001,
          longitude: 0.0005,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
      }),
    );

    await renderWithProviders(<Activity />);
    await startNavigation();

    await waitFor(() =>
      expect(Speech.speak).toHaveBeenCalledWith(
        'Вы находитесь примерно в 110 метрах от маршрута.',
        expect.objectContaining({ language: 'ru-RU' }),
      ),
    );
  });

  it.each([
    { language: LANGUAGES.russian, locale: 'ru-RU', text: 'Вы находитесь очень далеко от маршрута.' },
    { language: LANGUAGES.english, locale: 'en-US', text: 'You are very far from the route.' },
  ])(
    'uses a short voice warning when the route is more than 10 km away in $language',
    async ({ language, locale, text }) => {
      jest
        .spyOn(activityTrackLibrary, 'readSavedActivityTrack')
        .mockResolvedValue([{ coords: { latitude: 0, longitude: 0 } }, { coords: { latitude: 0, longitude: 0.001 } }]);
      mockStore.dispatch(changeLanguage(language));
      mockStore.dispatch(setActivityStatus(STATUSES.started));
      mockStore.dispatch(setNavigationTrackId('saved-route'));
      mockStore.dispatch(
        setLastPosition({
          timestamp: 1000,
          coords: {
            latitude: 36,
            longitude: 0.0005,
            accuracy: 5,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
        }),
      );

      await renderWithProviders(<Activity />);
      await startNavigation();

      await waitFor(() =>
        expect(Speech.speak).toHaveBeenCalledWith(text, expect.objectContaining({ language: locale })),
      );
    },
  );

  it('repeats the warning at the selected interval while the user stays off route', async () => {
    mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(1_000);
    jest
      .spyOn(activityTrackLibrary, 'readSavedActivityTrack')
      .mockResolvedValue([{ coords: { latitude: 0, longitude: 0 } }, { coords: { latitude: 0, longitude: 0.001 } }]);
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    mockStore.dispatch(setNavigationTrackId('saved-route'));
    mockStore.dispatch(setNavigationAlertRepeatIntervalMinutes(1));
    mockStore.dispatch(
      setLastPosition({
        timestamp: 1000,
        coords: {
          latitude: 0.001,
          longitude: 0.0005,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
      }),
    );

    await renderWithProviders(<Activity />);
    await startNavigation();

    await waitFor(() => expect(Speech.speak).toHaveBeenCalledTimes(1));
    mockDateNow.mockReturnValue(60_999);
    await act(async () => {
      mockStore.dispatch(
        setLastPosition({
          timestamp: 60_999,
          coords: {
            latitude: 0.001,
            longitude: 0.0005,
            accuracy: 5,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
        }),
      );
    });
    expect(Speech.speak).toHaveBeenCalledTimes(1);

    mockDateNow.mockReturnValue(61_000);
    await act(async () => {
      mockStore.dispatch(
        setLastPosition({
          timestamp: 61_000,
          coords: {
            latitude: 0.001,
            longitude: 0.0005,
            accuracy: 5,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
        }),
      );
    });
    await waitFor(() => expect(Speech.speak).toHaveBeenCalledTimes(2));
  });

  it('announces again after the user returns to the route and leaves it again', async () => {
    jest
      .spyOn(activityTrackLibrary, 'readSavedActivityTrack')
      .mockResolvedValue([{ coords: { latitude: 0, longitude: 0 } }, { coords: { latitude: 0, longitude: 0.001 } }]);
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    mockStore.dispatch(setNavigationTrackId('saved-route'));
    mockStore.dispatch(
      setLastPosition({
        timestamp: 1000,
        coords: {
          latitude: 0.001,
          longitude: 0.0005,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
      }),
    );

    await renderWithProviders(<Activity />);
    await startNavigation();
    await waitFor(() => expect(Speech.speak).toHaveBeenCalledTimes(1));

    await act(async () => {
      mockStore.dispatch(
        setLastPosition({
          timestamp: 2000,
          coords: {
            latitude: 0,
            longitude: 0.0005,
            accuracy: 5,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
        }),
      );
    });
    await act(async () => {
      mockStore.dispatch(
        setLastPosition({
          timestamp: 3000,
          coords: {
            latitude: 0.001,
            longitude: 0.0005,
            accuracy: 5,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
        }),
      );
    });

    await waitFor(() => expect(Speech.speak).toHaveBeenCalledTimes(2));
  });

  it('does not announce when the saved route has no valid segments', async () => {
    jest
      .spyOn(activityTrackLibrary, 'readSavedActivityTrack')
      .mockResolvedValue([
        { coords: { latitude: Number.NaN, longitude: 0 } },
        { coords: { latitude: 0, longitude: Number.NaN } },
      ]);
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    mockStore.dispatch(setNavigationTrackId('invalid-route'));
    mockStore.dispatch(
      setLastPosition({
        timestamp: 1000,
        coords: {
          latitude: 0.001,
          longitude: 0.0005,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
      }),
    );

    await renderWithProviders(<Activity />);
    await startNavigation();

    await waitFor(() => expect(screen.getByTestId('activity-map')).toBeOnTheScreen());
    expect(Speech.speak).not.toHaveBeenCalled();
  });

  it('does not speak while route alerts are muted and resumes after unmuting', async () => {
    jest
      .spyOn(activityTrackLibrary, 'readSavedActivityTrack')
      .mockResolvedValue([{ coords: { latitude: 0, longitude: 0 } }, { coords: { latitude: 0, longitude: 0.001 } }]);
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    mockStore.dispatch(setNavigationTrackId('saved-route'));
    mockStore.dispatch(setNavigationAlertsMuted(true));
    mockStore.dispatch(
      setLastPosition({
        timestamp: 1000,
        coords: {
          latitude: 0.001,
          longitude: 0.0005,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
      }),
    );

    await renderWithProviders(<Activity />);
    await startNavigation();

    await waitFor(() => expect(screen.getByTestId('activity-map')).toBeOnTheScreen());
    expect(Speech.speak).not.toHaveBeenCalled();
    await act(async () => {
      mockStore.dispatch(setNavigationAlertsMuted(false));
    });
    await waitFor(() => expect(Speech.speak).toHaveBeenCalledTimes(1));
  });

  it('does not announce a distance that has not exceeded the configured threshold', async () => {
    jest
      .spyOn(activityTrackLibrary, 'readSavedActivityTrack')
      .mockResolvedValue([{ coords: { latitude: 0, longitude: 0 } }, { coords: { latitude: 0, longitude: 0.001 } }]);
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    mockStore.dispatch(setNavigationTrackId('saved-route'));
    mockStore.dispatch(
      setLastPosition({
        timestamp: 1000,
        coords: {
          latitude: 0.0004,
          longitude: 0.0005,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
      }),
    );

    await renderWithProviders(<Activity />);
    await startNavigation();

    await waitFor(() => expect(screen.getByTestId('activity-map')).toBeOnTheScreen());
    expect(Speech.speak).not.toHaveBeenCalled();
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

    await waitFor(() => expect(mockErrorToast).toHaveBeenCalledWith(ACTIVITY_TRACKING_ERROR_COPY.pause, error));
    expect(mockStore.getState().location.activityStatus).toBe(STATUSES.continued);
    expect(mockStore.getState().location.isAppShutedByPhone).toBe(false);
  });
});
