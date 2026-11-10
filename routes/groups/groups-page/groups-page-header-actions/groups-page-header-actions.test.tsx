import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupsPageHeaderActions from './groups-page-header-actions';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('../../group-notification-settings/group-notification-settings', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ visible }: { visible: boolean }) =>
      visible ? React.createElement(View, { testID: 'group-notification-settings-dialog' }) : null,
  };
});

describe('GroupsPageHeaderActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  it('opens group creation and notification settings', async () => {
    await renderWithProviders(<GroupsPageHeaderActions />);

    await userEvent.press(screen.getByTestId('groups-create-button'));
    await userEvent.press(screen.getByTestId('groups-settings-button'));

    expect(mockPush).toHaveBeenCalledWith('/groups/create');
    expect(screen.getByTestId('group-notification-settings-dialog')).toBeOnTheScreen();
  });
});
