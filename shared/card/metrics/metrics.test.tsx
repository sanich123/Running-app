import { act, screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { activityApi } from '@R/services/activity/activity';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_DISTANCE, MOCK_DURATION } from '@T/mocks/mock-location';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { getSpeedInKmPerHour, getSpeedInMinsInKm } from '@U/location/location-utils';
import { formatDuration } from '@U/time-formatter';
import { ActivityCardContext } from '../context';
import CardMetrics from './metrics';
import type { ActivityCardData } from '../types';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  usePathname: () => 'some string',
  useRouter: () => ({
    push: mockPush,
  }),
}));

const defaultActivity: ActivityCardData = {
  date: '2026-08-09T10:00:00.000Z',
  sport: 'run',
  id: 'someUUID',
  userId: 'someUserId',
  duration: MOCK_DURATION,
  distance: MOCK_DISTANCE,
  elevationGain: 0,
  profile: {},
  commentsLength: 0,
};

function renderCardMetrics(
  activity: Partial<ActivityCardData>,
  options: { isFullView?: boolean; isShowDescription?: boolean } = {},
) {
  return renderWithProviders(
    <ActivityCardContext.Provider
      value={{
        activity: { ...defaultActivity, ...activity },
        isFullView: options.isFullView ?? false,
        isShowDescription: options.isShowDescription ?? false,
      }}>
      <CardMetrics />
    </ActivityCardContext.Provider>,
    { store: mockStore },
  );
}

describe('Card metrics', () => {
  it('should correctly renders', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderCardMetrics(
      { title: 'some title', elevationGain: 42, description: 'some description' },
      { isShowDescription: true },
    );
    ['pace', 'distance', 'time', 'elevation gain'].map((metric) =>
      expect(screen.getByText(new RegExp(metric, 'i'))).toBeOnTheScreen(),
    );
    [getSpeedInMinsInKm(MOCK_DISTANCE, MOCK_DURATION).paceAsString, formatDuration(MOCK_DURATION)].map((metric) =>
      expect(screen.getByText(new RegExp(`${metric}`, 'i'))).toBeOnTheScreen(),
    );
    expect(screen.getByText('some title')).toHaveProp('numberOfLines', 2);
    expect(screen.getByText('some title')).toHaveProp('ellipsizeMode', 'tail');
    expect(screen.getByText('some description')).toHaveProp('numberOfLines', 4);
    expect(screen.getByText('some description')).toHaveProp('ellipsizeMode', 'tail');
    expect(screen.getByText('42 m')).toBeOnTheScreen();
    expect(screen.queryByText('Description')).not.toBeOnTheScreen();
  });

  it('shows kilometres per hour and total steps for walking', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderCardMetrics({ title: 'walking', sport: 'walk', steps: 1234, elevationGain: 42, description: '' });

    expect(screen.getByText(/Speed/i)).toBeOnTheScreen();
    expect(screen.getByText(/Steps/i)).toBeOnTheScreen();
    expect(screen.getByText(`${getSpeedInKmPerHour(MOCK_DISTANCE, MOCK_DURATION).toFixed(1)} km/h`)).toBeOnTheScreen();
    expect(screen.getByText('1234')).toBeOnTheScreen();
    expect(screen.queryByText(/Pace/i)).not.toBeOnTheScreen();
    expect(screen.queryByText(/Elevation gain/i)).not.toBeOnTheScreen();
  });

  it('shows calories only in the full activity view', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderCardMetrics({ title: 'Бег', caloriesActive: 742, elevationGain: 0, description: '' });
    expect(screen.queryByText('742 ккал')).not.toBeOnTheScreen();

    await renderCardMetrics(
      { title: 'Бег', caloriesActive: 742, elevationGain: 0, description: '' },
      { isFullView: true },
    );
    expect(screen.getByText('742 ккал')).toBeOnTheScreen();
  });

  it('hides restricted activity metrics from other viewers', async () => {
    const originalUserId = mockStore.getState().auth.userId;
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await act(async () => {
      mockStore.dispatch(setMockUserId('external-viewer'));
    });

    try {
      await renderCardMetrics(
        {
          userId: 'activity-owner',
          averageHeartRate: 140,
          minHeartRate: 90,
          maxHeartRate: 175,
          elevationGain: 42,
          profile: {
            allowActivityHeartRateViewing: false,
            allowActivityElevationViewing: false,
            allowActivityPaceViewing: false,
          },
        },
        { isFullView: true },
      );

      expect(screen.queryByText(/Heart rate/i)).not.toBeOnTheScreen();
      expect(screen.queryByText(/Pace/i)).not.toBeOnTheScreen();
      expect(screen.queryByText(/Elevation gain/i)).not.toBeOnTheScreen();
      expect(screen.getByText(/Distance/i)).toBeOnTheScreen();
    } finally {
      await act(async () => {
        mockStore.dispatch(setMockUserId(originalUserId));
      });
    }
  });

  it.each([
    ['running without elevation gain', 'run', undefined, 0, /Elevation gain/i],
    ['walking without steps', 'walk', undefined, 42, /Steps/i],
    ['walking with zero steps', 'walk', 0, 42, /Steps/i],
  ])('hides the additional metric when there is %s', async (_caseName, sport, steps, elevationGain, metric) => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderCardMetrics({ title: sport, sport, steps, elevationGain, description: '' });

    expect(screen.queryByText(metric)).not.toBeOnTheScreen();
  });

  it.each(['hike', 'bike'])('keeps the existing three metrics for %s', async (sport) => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderCardMetrics({ title: sport, sport, description: '', elevationGain: 42 });

    expect(screen.getByText(/Speed/i)).toBeOnTheScreen();
    expect(screen.queryByText(/Elevation gain/i)).not.toBeOnTheScreen();
    expect(screen.queryByText(/Steps/i)).not.toBeOnTheScreen();
  });

  it('opens the full activity when the metrics are pressed', async () => {
    const user = userEvent.setup();
    await renderCardMetrics({ title: 'some title', elevationGain: 0, description: '' });
    await user.press(screen.getByText('some title'));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.activity}/someUUID?userId=someUserId`);
  });

  it('prefetches the activity chart before opening the activity details page', async () => {
    const originalUserId = mockStore.getState().auth.userId;
    const prefetch = jest
      .spyOn(activityApi.util, 'prefetch')
      .mockReturnValue((() => undefined) as ReturnType<typeof activityApi.util.prefetch>);
    const user = userEvent.setup();
    mockStore.dispatch(setMockUserId('viewer-1'));

    const { unmount } = await renderCardMetrics({ title: 'some title', elevationGain: 0, description: '' });
    try {
      await user.press(screen.getByText('some title'));

      expect(prefetch).toHaveBeenCalledWith(
        'getActivityChartData',
        { activityId: 'someUUID', viewerId: 'viewer-1' },
        { ifOlderThan: 60 },
      );
      expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.activity}/someUUID?userId=someUserId`);
    } finally {
      unmount();
      mockStore.dispatch(setMockUserId(originalUserId));
      prefetch.mockRestore();
    }
  });

  it('does not show a show-all action in the activity metrics card', async () => {
    await renderCardMetrics({ title: 'some title', elevationGain: 0, description: '' }, { isFullView: true });

    expect(screen.queryByTestId('activity-show-all-metrics-button')).toBeNull();
  });

  it('does not truncate the full activity description', async () => {
    await renderCardMetrics(
      { title: 'some title', elevationGain: 0, description: 'some description' },
      { isFullView: true, isShowDescription: true },
    );

    expect(screen.getByText('some title').props.numberOfLines).toBeUndefined();
    expect(screen.getByText('some description').props.numberOfLines).toBeUndefined();
  });
});
