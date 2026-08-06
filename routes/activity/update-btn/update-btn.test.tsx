import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { MOCK_SERVER_ACTIVITY, MOCK_SERVER_IDS } from '@T/responses/runich';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import UpdateBtn from './update-btn';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useGlobalSearchParams: () => ({ id: MOCK_SERVER_IDS.activityId }),
  useRouter: () => ({ push: mockPush }),
}));

describe('update btn', () => {
  it('loads the activity into the editor and navigates to manual editing', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<UpdateBtn />);
    const updateButton = screen.getByTestId('activity-update-button');
    await waitFor(() => expect(updateButton.props.accessibilityState?.disabled).toBe(false));
    await user.press(updateButton);
    expect(mockStore.getState().activity.activityId).toBe(MOCK_SERVER_ACTIVITY.id);
    expect(mockStore.getState().manualActivity.isEditingActivity).toBe(true);
    expect(mockStore.getState().additionalInfoActivity.title).toBe(MOCK_SERVER_ACTIVITY.title);
    expect(mockPush).toHaveBeenCalledWith('/(protected)/manual-activity');
  });
});
