import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { MOCK_SERVER_CHART_DATA } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { setMockUserId, mockStore } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityChart from './activity-chart';
import { HOME_ACTIVITY_FULL_VIEW } from '../metrics/const';

const ACTIVITY_IDS = {
  loading: 'chart-loading',
  error: 'chart-error',
  empty: 'chart-empty',
  full: 'chart-full',
  profile: 'chart-profile',
  noHeartRate: 'chart-no-heart-rate',
  noSpeed: 'chart-no-speed',
  restricted: 'chart-restricted',
  skipped: 'chart-skipped',
} as const;
jest.mock('@S/error-component/error-component', () => {
  const { Pressable } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ refetch }: { refetch: () => void }) => <Pressable testID="activity-chart-retry" onPress={refetch} />,
  };
});
jest.mock('./activity-time-chart/axis-selector-menu/axis-selector-menu', () => {
  const React = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({
      options,
      selectedMetric,
    }: {
      options: { metric: string; axisTitle: string }[];
      selectedMetric: string;
    }) => {
      const selectedOption = options.find(({ metric }) => metric === selectedMetric);
      return React.createElement(Text, null, selectedOption?.axisTitle);
    },
  };
});

describe('ActivityChart', () => {
  const labels = HOME_ACTIVITY_FULL_VIEW[LANGUAGES.russian];

  beforeEach(() => {
    mockStore.dispatch(setMockUserId('viewer-1'));
  });

  it('shows the loading state while chart data is being fetched', async () => {
    server.use(http.get(`${BASE_URL}/activity/${ACTIVITY_IDS.loading}/chart-data`, loadingResponse));

    await renderWithProviders(<ActivityChart activityId={ACTIVITY_IDS.loading} activityDistance={1_112} sport="run" />);

    expect(screen.getByText(labels.chartLoading)).toBeOnTheScreen();
    expect(screen.queryByTestId('activity-chart-plot')).not.toBeOnTheScreen();
  });

  it('lets the user retry after a chart request fails', async () => {
    const requests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/activity/${ACTIVITY_IDS.error}/chart-data`, ({ request }) => {
        requests.push(request.url);
        return errorResponse();
      }),
    );

    await renderWithProviders(<ActivityChart activityId={ACTIVITY_IDS.error} activityDistance={1_112} sport="run" />);
    await waitFor(() => expect(requests).toHaveLength(1));
    await waitFor(() => expect(screen.getByTestId('activity-chart-retry')).toBeOnTheScreen());
    await userEvent.press(screen.getByTestId('activity-chart-retry'));

    await waitFor(() => expect(requests).toHaveLength(2));
  });

  it('renders nothing when there is not enough chart data', async () => {
    const requests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/activity/${ACTIVITY_IDS.empty}/chart-data`, ({ request }) => {
        requests.push(request.url);
        return HttpResponse.json({ ...MOCK_SERVER_CHART_DATA, locations: [] });
      }),
    );

    await renderWithProviders(<ActivityChart activityId={ACTIVITY_IDS.empty} activityDistance={1_112} sport="run" />);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(screen.queryByTestId('activity-chart-plot')).not.toBeOnTheScreen();
    expect(screen.queryByText(labels.graphTitle)).not.toBeOnTheScreen();
  });

  it('shows the chart and its time labels when data is available', async () => {
    const requests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/activity/${ACTIVITY_IDS.full}/chart-data`, ({ request }) => {
        requests.push(request.url);
        return HttpResponse.json(MOCK_SERVER_CHART_DATA);
      }),
    );

    await renderWithProviders(<ActivityChart activityId={ACTIVITY_IDS.full} activityDistance={1_112} sport="run" />);

    expect(await screen.findByTestId('activity-chart-plot')).toBeOnTheScreen();
    expect(requests).toEqual([`${BASE_URL}/activity/${ACTIVITY_IDS.full}/chart-data`]);
    expect(screen.getByText(labels.graphTitle)).toBeOnTheScreen();
    expect(screen.getAllByText('00:00').length).toBeGreaterThan(0);
    expect(screen.getByText(labels.heartRateZonesTitle)).toBeOnTheScreen();
    expect(screen.getByText(labels.heartRateZonesActivityHint(150))).toBeOnTheScreen();
    expect(screen.getByText('≤ 89')).toBeOnTheScreen();
    expect(screen.getByText('90–104')).toBeOnTheScreen();
    expect(screen.getByText('105–119')).toBeOnTheScreen();
    expect(screen.getByText('120–134')).toBeOnTheScreen();
    expect(screen.getByText('≥ 135')).toBeOnTheScreen();
  });

  it('uses profile heart-rate reserve settings before age and workout defaults', async () => {
    server.use(
      http.get(`${BASE_URL}/activity/${ACTIVITY_IDS.profile}/chart-data`, () =>
        HttpResponse.json(MOCK_SERVER_CHART_DATA),
      ),
    );

    await renderWithProviders(
      <ActivityChart
        activityId={ACTIVITY_IDS.profile}
        activityDistance={1_112}
        sport="run"
        profileAge="40"
        profileRestingHeartRate="55"
        profileMaximumHeartRate="190"
      />,
    );

    expect(await screen.findByText(labels.heartRateZonesProfileHint(55, 190))).toBeOnTheScreen();
    expect(screen.getByText('≤ 135')).toBeOnTheScreen();
  });

  it('shows route metrics when the activity has no heart-rate samples', async () => {
    server.use(
      http.get(`${BASE_URL}/activity/${ACTIVITY_IDS.noHeartRate}/chart-data`, () =>
        HttpResponse.json({ ...MOCK_SERVER_CHART_DATA, heartRateSamples: [] }),
      ),
    );

    await renderWithProviders(
      <ActivityChart activityId={ACTIVITY_IDS.noHeartRate} activityDistance={1_112} sport="run" />,
    );

    expect(await screen.findByTestId('activity-chart-plot')).toBeOnTheScreen();
    expect(screen.getByText(labels.elevationAxisLabel)).toBeOnTheScreen();
    expect(screen.queryByText(labels.heartRateZonesTitle)).not.toBeOnTheScreen();
  });

  it('keeps the heart-rate chart available when route points cannot produce a speed series', async () => {
    server.use(
      http.get(`${BASE_URL}/activity/${ACTIVITY_IDS.noSpeed}/chart-data`, () =>
        HttpResponse.json({
          ...MOCK_SERVER_CHART_DATA,
          locations: MOCK_SERVER_CHART_DATA.locations.map((location) => ({
            ...location,
            coords: { ...location.coords, longitude: 0 },
          })),
        }),
      ),
    );

    await renderWithProviders(<ActivityChart activityId={ACTIVITY_IDS.noSpeed} activityDistance={1_112} sport="run" />);

    expect(await screen.findByTestId('activity-chart-plot')).toBeOnTheScreen();
    expect(screen.getByText(labels.heartRateAxisLabel)).toBeOnTheScreen();
    expect(screen.queryByText(labels.paceAxisLabel)).not.toBeOnTheScreen();
  });

  it('hides heart-rate data when the activity owner has restricted it', async () => {
    server.use(
      http.get(`${BASE_URL}/activity/${ACTIVITY_IDS.restricted}/chart-data`, () =>
        HttpResponse.json(MOCK_SERVER_CHART_DATA),
      ),
    );

    await renderWithProviders(
      <ActivityChart
        activityId={ACTIVITY_IDS.restricted}
        activityDistance={1_112}
        sport="run"
        canViewHeartRate={false}
      />,
    );

    expect(await screen.findByTestId('activity-chart-plot')).toBeOnTheScreen();
    expect(screen.queryByText(labels.heartRateZonesTitle)).not.toBeOnTheScreen();
    expect(screen.queryByText(labels.heartRateAxisLabel)).not.toBeOnTheScreen();
    expect(screen.getByText(labels.paceAxisLabel)).toBeOnTheScreen();
    expect(screen.getByText(labels.elevationAxisLabel)).toBeOnTheScreen();
  });

  it('hides the chart when only one metric is allowed', async () => {
    const requests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/activity/${ACTIVITY_IDS.skipped}/chart-data`, ({ request }) => {
        requests.push(request.url);
        return HttpResponse.json(MOCK_SERVER_CHART_DATA);
      }),
    );

    await renderWithProviders(
      <ActivityChart
        activityId={ACTIVITY_IDS.skipped}
        activityDistance={1_112}
        sport="run"
        canViewHeartRate={false}
        canViewElevation={false}
      />,
    );

    expect(screen.queryByTestId('activity-chart-plot')).not.toBeOnTheScreen();
    expect(screen.queryByText(labels.graphTitle)).not.toBeOnTheScreen();
    expect(requests).toEqual([]);
  });
});
