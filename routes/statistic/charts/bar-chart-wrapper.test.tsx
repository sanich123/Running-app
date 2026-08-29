import { act, screen } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import BarChartWrapper from './bar-chart-wrapper';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('react-native-gifted-charts', () => {
  const { View } = jest.requireActual('react-native');
  return { BarChart: (props: any) => <View testID="interactive-bar-chart" {...props} /> };
});

describe('bar chart wrapper', () => {
  it('opens statistics for the selected month', async () => {
    mockStore.dispatch(setUserId('statistics-user'));
    await renderWithProviders(
      <BarChartWrapper metricsArr={[{ value: 10, label: 'Jan' }]} year={2026} title="Distance" />,
    );
    await act(async () => screen.getByTestId('interactive-bar-chart').props.onPress({}, 4));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.monthStatistics}?userId=statistics-user&year=2026&month=4`);
  });

  it('renders an empty-state label when there are no values', async () => {
    await renderWithProviders(<BarChartWrapper metricsArr={[]} year={2026} title="Distance" />);

    expect(screen.getByText('Нет данных за этот период')).toBeOnTheScreen();
  });
});
