import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import CalendarActivities from './calendar-activities';
import type { MonthStatisticsResponse } from '@R/runich-api/types';

jest.mock('../../calendar-date-with-activity/calendar-date-with-activity', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="calendar-active-date" />;
});

const monthStatistics: MonthStatisticsResponse = {
  activities: [
    { duration: 1800, distance: 3000, speed: 6, date: '2026-08-04T12:00:00.000Z', id: 'run-1', sport: 'run' },
    { duration: 2400, distance: 4000, speed: 6, date: '2026-08-12T12:00:00.000Z', id: 'walk-1', sport: 'walk' },
  ],
  activitiesReducedBySport: {},
};
const props = { year: '2026', month: '7', selectedType: 'all', monthStatistics };

describe('CalendarActivities', () => {
  it('renders month activity dates from the provided statistics', async () => {
    await renderWithProviders(<CalendarActivities {...props} />);
    expect(screen.getAllByTestId('calendar-active-date')).toHaveLength(2);
  });
  it('filters calendar dates by the selected sport', async () => {
    await renderWithProviders(<CalendarActivities {...props} selectedType="walk" />);
    expect(screen.getAllByTestId('calendar-active-date')).toHaveLength(1);
  });
});
