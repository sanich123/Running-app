import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { DASHBOARD_LABELS, DASHBOARD_MONTHS } from '../const';
import AnnualActivityChart from './annual-activity-chart';

jest.mock('react-native-gifted-charts', () => {
  const { View } = jest.requireActual('react-native');
  return { LineChart: View };
});

describe('AnnualActivityChart', () => {
  it('opens the currently selected month from its summary', async () => {
    const user = userEvent.setup();
    const onOpenMonth = jest.fn();

    await renderWithProviders(
      <AnnualActivityChart
        data={[]}
        width={320}
        months={DASHBOARD_MONTHS[LANGUAGES.english]}
        selectedMonth={4}
        metric="activities"
        selectedValue={3}
        averageValue={2}
        maxValue={5}
        noOfSections={5}
        stepValue={1}
        workoutCount={3}
        labels={DASHBOARD_LABELS[LANGUAGES.english]}
        onOpenMonth={onOpenMonth}
      />,
    );
    await user.press(screen.getByTestId('dashboard-selected-month'));

    expect(onOpenMonth).toHaveBeenCalledWith(4);
  });
});
