import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { saveUnsendedActivity } from '@R/slices/unsended-activity/unsended-activity';
import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import UnsendedActivitiesIndicator from './unsended-activities-indicator';

describe('unsended activities indicator', () => {
  it('retries an unsynced activity and removes it after success', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(saveUnsendedActivity({ body: MOCK_ACTIVITY, id: 'someUserId' }));
    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await user.press(screen.getByTestId('send-unsynced-activities'));
    await waitFor(() => expect(mockStore.getState().unsendedActivity.unsyncedActivities).toHaveLength(0));
  });

  it('allows the user to discard unsynced activities', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(saveUnsendedActivity({ body: MOCK_ACTIVITY, id: 'someUserId' }));
    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await user.press(screen.getByTestId('delete-unsynced-activities'));
    expect(mockStore.getState().unsendedActivity.unsyncedActivities).toHaveLength(0);
  });
});
