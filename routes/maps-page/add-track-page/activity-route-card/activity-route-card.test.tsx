import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityRouteCard from './activity-route-card';
import { MAPS_PAGE_COPY } from '../../const';
import type { ActivityRouteWorkoutListItemResponse } from '@R/runich-api/types';

const activity: ActivityRouteWorkoutListItemResponse = {
  id: 'workout-1',
  userId: 'user-1',
  date: '2026-10-31T00:00:00.000Z',
  timeZone: 'UTC',
  title: 'Morning run',
  sport: 'running',
  duration: 3_600_000,
  distance: 5200,
  elevationGain: 25,
  profile: {},
  _count: { comments: 0, likes: 0 },
  routePointCount: 42,
};

describe('activity route card', () => {
  it('shows route details and adds the selected activity', async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();
    await renderWithProviders(
      <ActivityRouteCard
        activity={activity}
        copy={MAPS_PAGE_COPY[LANGUAGES.english]}
        language={LANGUAGES.english}
        isWorking={false}
        isDisabled={false}
        onAdd={onAdd}
      />,
    );

    expect(screen.getByText('Morning run')).toBeOnTheScreen();
    expect(screen.getByText('Oct 31, 2026 · 5.2 km')).toBeOnTheScreen();
    expect(screen.getByText('42 points')).toBeOnTheScreen();
    await user.press(screen.getByTestId(`add-activity-track-${activity.id}`));
    expect(onAdd).toHaveBeenCalledWith(activity);
  });

  it('omits a blank title and uses the fallback sport icon for unknown sport names', async () => {
    const activityWithoutTitle = { ...activity, title: '  ', sport: 'unknown-sport' };
    await renderWithProviders(
      <ActivityRouteCard
        activity={activityWithoutTitle}
        copy={MAPS_PAGE_COPY[LANGUAGES.english]}
        language={LANGUAGES.english}
        isWorking={false}
        isDisabled={false}
        onAdd={jest.fn()}
      />,
    );

    expect(screen.queryByText('Morning run')).toBeNull();
    expect(screen.getByText('Oct 31, 2026 · 5.2 km')).toBeOnTheScreen();
  });
});
