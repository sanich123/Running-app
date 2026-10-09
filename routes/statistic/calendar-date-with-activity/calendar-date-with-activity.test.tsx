import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
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
        dateValue="1"
        activities={[{ id: 'activity-one', sport: 'run' }]}
      />,
    );
    await user.press(screen.getByTestId('calendar-activities-activity-one'));
    expect(screen.getByTestId('calendar-activity-icon-activity-one')).toBeOnTheScreen();
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.activity}/activity-one`);
  });

  it('opens the activity list when the day contains multiple workouts', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <CalendarDateWithActivity
        isWeekend={false}
        isTitle={false}
        dateValue="2"
        activities={[
          { id: 'first', sport: 'run' },
          { id: 'second', sport: 'walk' },
        ]}
      />,
    );
    expect(screen.getByText('×2')).toBeOnTheScreen();
    expect(screen.queryByTestId('calendar-activity-icon-first')).not.toBeOnTheScreen();
    await user.press(screen.getByTestId('calendar-activities-first-second'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: `/${ROUTES.activitiesList}/${ROUTES.routeIds}`,
      params: { ids: ['first', 'second'] },
    });
  });
});
