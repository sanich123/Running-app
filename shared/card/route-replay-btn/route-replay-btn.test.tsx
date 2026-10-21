import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import type * as RouteReplayBtnModule from './route-replay-btn';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

const RouteReplayBtn = require('./route-replay-btn').default as typeof RouteReplayBtnModule.default;

describe('RouteReplayBtn', () => {
  it('opens the activity replay for the selected user', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<RouteReplayBtn activityId="activity-id" userId="user id" />);

    await user.press(screen.getByTestId('activity-card-route-replay-button'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.map}/activity-id?replay=1&userId=user%20id`);
  });
});
