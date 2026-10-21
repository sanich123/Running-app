import { screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { MOCK_SERVER_ACTIVITY } from '@T/responses/runich';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityActionsMenu from './activity-actions-menu';
import type { ActivityResponse } from '@R/runich-api/types';

const originalPlatformOS = Platform.OS;

afterEach(() => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOS });
});

const activity = MOCK_SERVER_ACTIVITY as unknown as ActivityResponse;

describe('activity actions menu', () => {
  it('renders separate edit and delete actions for the owner', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockStore.dispatch(setMockUserId(activity.userId));
    const user = userEvent.setup();

    await renderWithProviders(<ActivityActionsMenu activity={activity} />);

    await user.press(screen.getByTestId('activity-actions-menu-trigger'));
    expect(screen.getByLabelText('Действия с тренировкой')).toBeOnTheScreen();
    expect(screen.getByText('Редактировать')).toBeOnTheScreen();
    expect(screen.getByText('Удалить')).toBeOnTheScreen();
  });

  it('does not render the menu for another user', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockStore.dispatch(setMockUserId('external-viewer'));

    await renderWithProviders(<ActivityActionsMenu activity={activity} />);

    expect(screen.queryByTestId('activity-actions-menu-trigger')).toBeNull();
    expect(screen.queryByTestId('activity-actions-menu-edit')).toBeNull();
    expect(screen.queryByTestId('activity-actions-menu-delete')).toBeNull();
  });
});
