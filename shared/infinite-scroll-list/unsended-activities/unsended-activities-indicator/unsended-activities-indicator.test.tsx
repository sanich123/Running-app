import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { queueUnsyncedActivity } from '@R/slices/activity/activity';
import { MOCK_UNSYNCED_ACTIVITY } from '@T/mocks/mock-unsynced-activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import UnsendedActivitiesIndicator from './unsended-activities-indicator';

describe('unsended activities indicator', () => {
  it('retries an unsynced activity and removes it after success', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(queueUnsyncedActivity(MOCK_UNSYNCED_ACTIVITY));
    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await user.press(screen.getByTestId('send-unsynced-activities'));
    await waitFor(() => expect(mockStore.getState().activity.unsyncedActivities).toHaveLength(0));
  });

  it('allows the user to discard unsynced activities', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(queueUnsyncedActivity(MOCK_UNSYNCED_ACTIVITY));
    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await user.press(screen.getByTestId('delete-unsynced-activities'));
    expect(mockStore.getState().activity.unsyncedActivities).toHaveLength(0);
  });
});
