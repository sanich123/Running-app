import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import type { MenuViewProps } from './types';
import type { MenuItemProps } from '../menu-item/types';

const AndroidMenuView = require('./menu-view.tsx').default as (props: MenuViewProps) => React.JSX.Element;
const AndroidMenuItem = require('../menu-item/menu-item.tsx').default as (props: MenuItemProps) => React.JSX.Element;

describe('Android workout actions menu', () => {
  it('opens the menu from the three-dot header trigger and runs the selected action', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    await renderWithProviders(
      <AndroidMenuView accessibilityLabel="Workout actions">
        <AndroidMenuItem action="edit" label="Edit workout" testID="menu-view-child" onPress={onEdit} />
      </AndroidMenuView>,
    );

    await user.press(screen.getByTestId('activity-actions-menu-trigger'));
    await user.press(screen.getByTestId('menu-view-child'));

    expect(onEdit).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.getByTestId('activity-actions-menu-trigger').props.accessibilityState.expanded).toBe(false),
    );
  });
});
