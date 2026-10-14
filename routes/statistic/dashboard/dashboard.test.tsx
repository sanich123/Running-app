import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_SERVER_STATISTICS, MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import Dashboard from './dashboard';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('react-native-gifted-charts', () => {
  const { View } = jest.requireActual('react-native');
  return { LineChart: (props: Record<string, unknown>) => <View testID="dashboard-line-chart" {...props} /> };
});

describe('statistics dashboard', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
  });

  it('renders the dashboard and reveals a selected day after pressing the heatmap', async () => {
    await renderWithProviders(<Dashboard />);

    expect(await screen.findByTestId('dashboard-line-chart')).toBeOnTheScreen();
    await waitFor(() => expect(screen.getByText('Открыть месяц')).toBeOnTheScreen());
    fireEvent.press(screen.getByTestId('dashboard-day-2026-08-04'));

    expect(screen.getByText('вторник, 4 августа')).toBeOnTheScreen();
    expect(screen.getByText('Открыть месяц')).toBeOnTheScreen();
  });

  it('shows English labels for the year controls', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<Dashboard />);

    expect(await screen.findByLabelText('Previous year')).toBeOnTheScreen();
    expect(screen.getByLabelText('Next year')).toBeOnTheScreen();
  });

  it('changes the metric and navigates to the selected month', async () => {
    await renderWithProviders(<Dashboard />);

    fireEvent.press(await screen.findByText('Время', { exact: true }));
    await waitFor(() => expect(screen.getAllByText('Время').length).toBeGreaterThan(0));

    await waitFor(() => expect(screen.getByText('Открыть месяц')).toBeOnTheScreen());
    fireEvent.press(screen.getByText('Открыть месяц'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/month-statistic')));
  });

  it('shows the selected month when a chart point is pressed and navigates from its summary', async () => {
    await renderWithProviders(<Dashboard />);

    const chart = await screen.findByTestId('dashboard-line-chart');
    expect(chart.props.focusEnabled).toBe(false);
    expect(chart.props.data[7].dataPointRadius).toBe(10);
    await act(async () => chart.props.data[4].onPress());

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByTestId('dashboard-selected-month').props.accessibilityLabel).toBe('Май, Открыть месяц');
    const updatedChart = screen.getByTestId('dashboard-line-chart');
    expect(updatedChart.props.data[4].dataPointRadius).toBe(10);
    expect(updatedChart.props.data[7].dataPointRadius).toBeUndefined();

    fireEvent.press(screen.getByTestId('dashboard-selected-month'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('month=4'));
  });

  it('does not attach SVG point press handlers on web', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    try {
      await renderWithProviders(<Dashboard />);

      const chart = await screen.findByTestId('dashboard-line-chart');
      expect(chart.props.data[4].onPress).toBeUndefined();
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    }
  });

  it('shows the empty state when the server confirms there are no activities', async () => {
    server.use(
      http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/year-category`, () =>
        HttpResponse.json({ isUserHasActivities: false }),
      ),
    );
    await renderWithProviders(<Dashboard />);

    expect(await screen.findByText('Активностей пока нет')).toBeOnTheScreen();
    expect(screen.queryByTestId('dashboard-line-chart')).toBeNull();
  });

  it('shows the retryable error state when annual statistics fail', async () => {
    server.use(
      http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/year-category`, () =>
        HttpResponse.json({ message: 'statistics unavailable' }, { status: 500 }),
      ),
    );
    await renderWithProviders(<Dashboard />);

    expect(await screen.findByText(/statistics unavailable/i)).toBeOnTheScreen();
  });

  it('keeps the loading skeleton while no account is selected', async () => {
    mockStore.dispatch(setMockUserId(''));
    await renderWithProviders(<Dashboard />);

    expect(screen.getByTestId('dashboard-skeleton')).toBeOnTheScreen();
    expect(screen.queryByTestId('dashboard-line-chart')).toBeNull();
  });

  it('selects a sport with annual data', async () => {
    const yearlyData = MOCK_SERVER_STATISTICS.year[2026];
    server.use(
      http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/year-category`, () =>
        HttpResponse.json({
          isUserHasActivities: true,
          2026: {
            ...yearlyData,
            run: { totalDuration: 3_600, totalDistance: 10_000, totalItems: 2 },
          },
        }),
      ),
    );
    await renderWithProviders(<Dashboard />);

    expect(await screen.findByText('2026')).toBeOnTheScreen();
    await waitFor(() => expect(screen.getAllByText('Бег').length).toBeGreaterThan(0));
    fireEvent.press(screen.getAllByText('Бег')[0]);
    expect(screen.getAllByText('Бег').length).toBeGreaterThan(0);
  });

  it('shows step and calorie metrics when annual totals are non-zero', async () => {
    const yearData = MOCK_SERVER_STATISTICS.year[2026];
    server.use(
      http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/year-category`, () =>
        HttpResponse.json({
          isUserHasActivities: true,
          2026: {
            ...yearData,
            all: { ...yearData.all, totalSteps: 2_400, totalCaloriesActive: 850 },
          },
        }),
      ),
    );
    await renderWithProviders(<Dashboard />);

    expect(await screen.findByText('Шаги', { exact: true })).toBeOnTheScreen();
    expect(screen.getByText('Калории', { exact: true })).toBeOnTheScreen();
  });

  it('hides step and calorie metrics when annual totals are zero', async () => {
    const yearData = MOCK_SERVER_STATISTICS.year[2026];
    server.use(
      http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/year-category`, () =>
        HttpResponse.json({
          isUserHasActivities: true,
          2026: {
            ...yearData,
            all: { ...yearData.all, totalSteps: 0, totalCaloriesActive: 0 },
          },
        }),
      ),
    );
    await renderWithProviders(<Dashboard />);

    expect(await screen.findByTestId('dashboard-line-chart')).toBeOnTheScreen();
    expect(screen.queryByText('Шаги', { exact: true })).toBeNull();
    expect(screen.queryByText('Калории', { exact: true })).toBeNull();
  });
});
