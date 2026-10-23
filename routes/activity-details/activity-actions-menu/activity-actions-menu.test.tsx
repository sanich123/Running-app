import { screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { MOCK_SERVER_ACTIVITY } from '@T/responses/runich';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityActionsMenu from './activity-actions-menu';
import { ACTIVITY_ACTIONS_MENU } from './const';
import { REPORT_CONTENT_COPY } from '../../../shared/moderation/report-content-dialog/const';
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

  it('lets another user report the activity from the actions menu', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockStore.dispatch(setMockUserId('external-viewer'));
    const user = userEvent.setup();

    await renderWithProviders(<ActivityActionsMenu activity={activity} />);

    await user.press(screen.getByTestId('activity-actions-menu-trigger'));
    await user.press(screen.getByText(ACTIVITY_ACTIONS_MENU[LANGUAGES.russian].report));
    expect(screen.getByText(REPORT_CONTENT_COPY[LANGUAGES.russian].title)).toBeOnTheScreen();
    expect(screen.queryByTestId('activity-actions-menu-edit')).toBeNull();
    expect(screen.queryByTestId('activity-actions-menu-delete')).toBeNull();
  });
});
