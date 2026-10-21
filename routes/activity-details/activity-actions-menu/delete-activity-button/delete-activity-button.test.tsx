import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Platform } from 'react-native';
import * as errorToastModule from '@S/error-toast/error-toast';
import { MOCK_SERVER_ACTIVITY } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import DeleteActivityButton from './delete-activity-button';
import type { ActivityResponse } from '@R/runich-api/types';

const mockBack = jest.fn();
const activity = MOCK_SERVER_ACTIVITY as unknown as ActivityResponse;
const originalPlatformOS = Platform.OS;

jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack }) }));
jest.mock('@expo/ui/swift-ui', () => {
  const React = jest.requireActual('react');
  const { Pressable, Text } = jest.requireActual('react-native');

  return {
    Button: ({ label, onPress, testID }: { label: string; onPress?: () => void; testID?: string }) =>
      React.createElement(
        Pressable,
        { accessibilityRole: 'button', onPress, testID },
        React.createElement(Text, null, label),
      ),
  };
});

afterEach(() => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOS });
  mockStore.dispatch({ type: 'loading/resetLoading' });
  mockBack.mockClear();
});

describe('delete activity button', () => {
  it('confirms deletion and returns after the request succeeds', async () => {
    mockStore.dispatch(setMockUserId(activity.userId));
    const user = userEvent.setup();
    let deletedUrl = '';
    server.use(
      http.delete(`${BASE_URL}/activity/:activityId`, ({ request }) => {
        deletedUrl = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await renderWithProviders(<DeleteActivityButton activity={activity} />);
    await user.press(screen.getByTestId('activity-actions-menu-delete'));
    await user.press(await screen.findByTestId('confirm-dialog-confirm-button'));

    await waitFor(() => expect(deletedUrl).toContain(`/activity/${activity.id}`));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('deletes directly on web and reports request errors', async () => {
    mockStore.dispatch(setMockUserId(activity.userId));
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
    server.use(
      http.delete(`${BASE_URL}/activity/:activityId`, () =>
        HttpResponse.json({ message: 'Delete failed' }, { status: 500 }),
      ),
    );

    await renderWithProviders(<DeleteActivityButton activity={activity} />);
    await userEvent.press(screen.getByTestId('activity-actions-menu-delete'));

    await waitFor(() => expect(errorToast).toHaveBeenCalled());
    expect(mockBack).not.toHaveBeenCalled();
    errorToast.mockRestore();
  });

  it('does not render the delete action for a non-owner', async () => {
    mockStore.dispatch(setMockUserId('external-viewer'));

    await renderWithProviders(<DeleteActivityButton activity={activity} />);

    expect(screen.queryByTestId('activity-actions-menu-delete')).toBeNull();
  });
});
