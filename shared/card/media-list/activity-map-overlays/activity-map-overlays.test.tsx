import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { DEFAULT_ACTIVITY_CARD } from '@T/mocks/const';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityMapOverlays from './activity-map-overlays';
import { ActivityCardContext } from '../../context';
import type { ActivityCardData } from '../../types';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

async function renderActivityMapOverlays(activity: Partial<ActivityCardData> = {}) {
  return await renderWithProviders(
    <ActivityCardContext.Provider
      value={{
        activity: { ...DEFAULT_ACTIVITY_CARD, ...activity },
        isFullView: false,
        isShowDescription: false,
      }}>
      <ActivityMapOverlays />
    </ActivityCardContext.Provider>,
  );
}

describe('ActivityMapOverlays', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockStore.dispatch(setMockUserId('activity-owner'));
  });

  it('shows the owner actions and opens route replay', async () => {
    const user = userEvent.setup();
    await renderActivityMapOverlays({
      weatherTemperature: 18,
      weatherWindSpeed: 6,
      isFavorite: false,
    });

    expect(screen.getByTestId('activity-card-add-media-button')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-favorite-button')).toBeOnTheScreen();
    await user.press(screen.getByTestId('activity-card-route-replay-button'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.map}/activity-id?replay=1&userId=activity-owner`);
  });

  it('hides owner actions and respects the route replay privacy setting', async () => {
    mockStore.dispatch(setMockUserId('viewer-id'));
    await renderActivityMapOverlays({ profile: { allowActivityReplayViewing: false } });

    expect(screen.queryByTestId('activity-card-add-media-button')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('activity-favorite-button')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('activity-card-route-replay-button')).not.toBeOnTheScreen();
  });
});
