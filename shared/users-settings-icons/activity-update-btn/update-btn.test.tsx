import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { MOCK_SERVER_ACTIVITY, MOCK_SERVER_IDS } from '@T/responses/runich';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import UpdateBtn from './update-btn';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useGlobalSearchParams: () => ({ id: MOCK_SERVER_IDS.activityId }),
  usePathname: () => `/activity/${MOCK_SERVER_IDS.activityId}`,
  useRouter: () => ({ push: mockPush }),
}));

describe('update btn', () => {
  it('loads the activity into the editor and navigates to manual editing', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<UpdateBtn />);
    const updateButton = screen.getByTestId('activity-update-button');
    await waitFor(() => expect(updateButton.props.accessibilityState?.disabled).toBe(false));
    await user.press(updateButton);
    const state = mockStore.getState();
    expect(state.additionalInfoActivity).toEqual(
      expect.objectContaining({
        photoVideoUrls: MOCK_SERVER_ACTIVITY.photoVideoUrls,
      }),
    );
    expect(mockPush).toHaveBeenCalledWith({
      pathname: `/${ROUTES.manualActivity}`,
      params: {
        cameraVisible: 'false',
        id: MOCK_SERVER_ACTIVITY.id,
        manualDate: new Date(MOCK_SERVER_ACTIVITY.date).toISOString(),
        manualDistance: '28.32',
        manualHours: '0',
        manualMinutes: '0',
        manualSeconds: '3',
        mode: 'edit',
        title: MOCK_SERVER_ACTIVITY.title,
        description: MOCK_SERVER_ACTIVITY.description,
        sport: MOCK_SERVER_ACTIVITY.sport,
        emotion: MOCK_SERVER_ACTIVITY.emotion,
        isPublic: String(MOCK_SERVER_ACTIVITY.isPublic),
      },
    });
  });
});
