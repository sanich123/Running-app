import { saveUnsendedActivity, setIsHaveUnsyncedActivity } from '@R/slices/activity/activity';
import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';
import UnsendedActivitiesIndicator from './unsended-activities-indicator';

describe('Unsended activities indicator', () => {
  it('should correctly renders when a success in english, when isHaveUnsyncedActivity and unsyncedActivities.length > 0', async () => {
    mockStore.dispatch(
      saveUnsendedActivity({
        body: { MOCK_ACTIVITY },
        id: 'someUserId',
      }),
    );
    mockStore.dispatch(
      saveUnsendedActivity({
        body: { MOCK_ACTIVITY },
        id: 'someUserId',
      }),
    );
    mockStore.dispatch(setIsHaveUnsyncedActivity(true));
    renderWithProviders(<UnsendedActivitiesIndicator />, { store: mockStore });
    expect(await screen.findByText(/вручную/i)).toBeOnTheScreen();
  });
});
