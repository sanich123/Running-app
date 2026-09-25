import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useGetAnnualStatisticsByUserIdQuery } from '@R/services/statistics/statistics';
import CalendarActivities from '@Routes/statistic/calendar/calendar';
import Charts from '@Routes/statistic/charts/charts';
import MonthStatistics from '@Routes/statistic/month-statistics/month-statistics';
import { MOCK_SERVER_ACTIVITY, MOCK_SERVER_IDS } from '@T/responses/runich';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import type { MonthMetrics } from '@Routes/statistic/charts/types';

const mockPush = jest.fn();
let mockParams = { userId: MOCK_SERVER_IDS.userId, year: '2026', month: '7' };

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('react-native-gifted-charts', () => {
  const { View } = jest.requireActual('react-native');
  return { BarChart: (props: any) => <View testID="statistics-bar-chart" {...props} /> };
});

function AnnualStatisticsPage() {
  const { data, isLoading } = useGetAnnualStatisticsByUserIdQuery({ userId: MOCK_SERVER_IDS.userId });
  if (isLoading || !data) return <ActivityIndicator testID="statistics-loading" />;
  const yearStatistics = data['2026'];
  const monthMetrics = typeof yearStatistics === 'object' && yearStatistics ? (yearStatistics.all as MonthMetrics) : {};

  return (
    <>
      <Text>Статистика</Text>
      <Charts year={2026} months={monthMetrics ?? {}} />
    </>
  );
}

describe('statistics integration flows', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockParams = { userId: MOCK_SERVER_IDS.userId, year: '2026', month: '7' };
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
  });

  it('opens the statistics page and navigates from a year chart to monthly statistics', async () => {
    await renderWithProviders(<AnnualStatisticsPage />);
    expect(await screen.findByTestId('statistics-bar-chart')).toBeOnTheScreen();
    expect(screen.getByText('Статистика')).toBeOnTheScreen();

    await act(async () => screen.getByTestId('statistics-bar-chart').props.onPress({}, 7));
    expect(mockPush).toHaveBeenCalledWith(
      `/${ROUTES.monthStatistics}?userId=${MOCK_SERVER_IDS.userId}&year=2026&month=7`,
    );
  });

  it('opens monthly statistics and displays the activity calendar', async () => {
    await renderWithProviders(<MonthStatistics />);
    expect(await screen.findByText(/август 2026|August 2026/i)).toBeOnTheScreen();
    expect(await screen.findByText('Календарь тренировок')).toBeOnTheScreen();
    expect(screen.getByTestId(`calendar-activities-${MOCK_SERVER_IDS.activityId}`)).toBeOnTheScreen();
  });

  it('opens an activity from a day with a recorded workout', async () => {
    await renderWithProviders(
      <CalendarActivities userId={MOCK_SERVER_IDS.userId} year="2026" month="7" selectedType="all" />,
    );
    const activityDay = await screen.findByTestId(`calendar-activities-${MOCK_SERVER_IDS.activityId}`);
    await userEvent.press(activityDay);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.activity}/${MOCK_SERVER_ACTIVITY.id}`));
  });
});
