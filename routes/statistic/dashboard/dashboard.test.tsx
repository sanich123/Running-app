import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
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
    await act(async () => chart.props.data[4].onPress());

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByTestId('dashboard-selected-month').props.accessibilityLabel).toBe('Май, Открыть месяц');

    fireEvent.press(screen.getByTestId('dashboard-selected-month'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('month=4'));
  });
});
