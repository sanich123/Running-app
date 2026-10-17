import { screen } from '@testing-library/react-native';
import { MOCK_SERVER_ACTIVITY } from '@T/responses/runich';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityActionsMenu from './activity-actions-menu';
import type { ActivityResponse } from '@R/runich-api/types';

jest.mock('@expo/ui/swift-ui', () => {
  const React = jest.requireActual('react');
  const { Pressable, Text, View } = jest.requireActual('react-native');

  return {
    Button: ({ label, onPress, testID }: { label: string; onPress?: () => void; testID?: string }) =>
      React.createElement(
        Pressable,
        { accessibilityRole: 'button', onPress, testID },
        React.createElement(Text, null, label),
      ),
    Host: ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children),
    Menu: ({ children, label, testID }: { children: React.ReactNode; label: string; testID?: string }) =>
      React.createElement(View, { accessibilityLabel: label, testID }, children),
  };
});
jest.mock('@expo/ui/swift-ui/modifiers', () => ({ labelStyle: jest.fn() }));

const activity = MOCK_SERVER_ACTIVITY as unknown as ActivityResponse;

describe('activity actions menu', () => {
  it('renders separate edit and delete actions for the owner', async () => {
    mockStore.dispatch(setMockUserId(activity.userId));

    await renderWithProviders(<ActivityActionsMenu activity={activity} />);

    expect(screen.getByLabelText('Действия с тренировкой')).toBeOnTheScreen();
    expect(screen.getByText('Редактировать')).toBeOnTheScreen();
    expect(screen.getByText('Удалить')).toBeOnTheScreen();
  });

  it('does not render the menu for another user', async () => {
    mockStore.dispatch(setMockUserId('external-viewer'));

    await renderWithProviders(<ActivityActionsMenu activity={activity} />);

    expect(screen.queryByTestId('activity-actions-menu-trigger')).toBeNull();
    expect(screen.queryByTestId('activity-actions-menu-edit')).toBeNull();
    expect(screen.queryByTestId('activity-actions-menu-delete')).toBeNull();
  });
});
