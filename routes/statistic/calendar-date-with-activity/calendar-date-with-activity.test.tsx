import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import CalendarDateWithActivity from './calendar-date-with-activity';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('calendar date with activity', () => {
  it('opens the only activity on the selected day', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <CalendarDateWithActivity
        isWeekend={false}
        isTitle={false}
        isEmptyCell={false}
        dateValue="1"
        activities={[{ id: 'activity-one', sport: 'run' }]}
      />,
    );
    await user.press(screen.getByTestId('calendar-activities-activity-one'));
    expect(mockPush).toHaveBeenCalledWith('/(protected)/activity/activity-one');
  });

  it('opens the activity list when the day contains multiple workouts', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <CalendarDateWithActivity
        isWeekend={false}
        isTitle={false}
        isEmptyCell={false}
        dateValue="2"
        activities={[
          { id: 'first', sport: 'run' },
          { id: 'second', sport: 'walk' },
        ]}
      />,
    );
    await user.press(screen.getByTestId('calendar-activities-first-second'));
    expect(mockPush).toHaveBeenCalledWith('/(protected)/activities-list/ids=first&ids=second');
  });
});
