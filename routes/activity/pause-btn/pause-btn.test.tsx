import { screen, userEvent } from '@testing-library/react-native';
import { STATUSES } from '@const/enums';
import { setActivityStatus } from '@R/slices/location/location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import PauseBtn from './pause-btn';

describe('pause btn', () => {
  it('pauses and resumes activity recording', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<PauseBtn />);
    await user.press(screen.getByTestId('activity-pause-toggle'));
    expect(mockStore.getState().location.activityStatus).toBe(STATUSES.paused);
    await user.press(screen.getByTestId('activity-pause-toggle'));
    expect(mockStore.getState().location.activityStatus).toBe(STATUSES.continued);
  });
});
