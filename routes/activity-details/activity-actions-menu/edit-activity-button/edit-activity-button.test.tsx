import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { MOCK_SERVER_ACTIVITY } from '@T/responses/runich';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import EditActivityButton from './edit-activity-button';
import type { ActivityResponse } from '@R/runich-api/types';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
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

const activity = MOCK_SERVER_ACTIVITY as unknown as ActivityResponse;

describe('edit activity button', () => {
  it('loads the selected workout into the edit flow', async () => {
    mockStore.dispatch(setMockUserId(activity.userId));
    const user = userEvent.setup();

    await renderWithProviders(<EditActivityButton activity={activity} />);
    expect(screen.getByText('Редактировать')).toBeOnTheScreen();
    await user.press(screen.getByTestId('activity-actions-menu-edit'));

    expect(mockStore.getState().activity.media).toEqual(activity.media);
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: `/${ROUTES.manualActivity}`,
        params: expect.objectContaining({ mode: 'edit' }),
      }),
    );
    mockPush.mockClear();
  });
});
