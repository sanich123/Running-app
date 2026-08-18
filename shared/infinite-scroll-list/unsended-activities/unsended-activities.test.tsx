import { screen } from '@testing-library/react-native';
import { queueUnsyncedActivity } from '@R/slices/activity/activity';
import { MOCK_UNSYNCED_ACTIVITY } from '@T/mocks/mock-unsynced-activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import UnsendedActivitiesIndicator from './unsended-activities-indicator';

describe('Unsended activities indicator', () => {
  it('should correctly renders when a success in english, when isHaveUnsyncedActivity and unsyncedActivities.length > 0', async () => {
    mockStore.dispatch(queueUnsyncedActivity(MOCK_UNSYNCED_ACTIVITY));
    mockStore.dispatch(queueUnsyncedActivity(MOCK_UNSYNCED_ACTIVITY));
    await renderWithProviders(<UnsendedActivitiesIndicator />, { store: mockStore });
    expect(await screen.findByTestId('send-unsynced-activities')).toBeOnTheScreen();
    expect(await screen.findByTestId('delete-unsynced-activities')).toBeOnTheScreen();
  });
});
