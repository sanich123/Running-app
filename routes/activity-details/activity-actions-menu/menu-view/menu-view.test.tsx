import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import MenuView from './menu-view';
import MenuItem from '../menu-item/menu-item';

describe('activity actions menu view', () => {
  it('opens from the trigger, runs the selected action, and closes', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    await renderWithProviders(
      <MenuView accessibilityLabel="Workout actions">
        <MenuItem action="edit" label="Edit workout" testID="menu-view-child" onPress={onEdit} />
      </MenuView>,
    );

    const trigger = screen.getByTestId('activity-actions-menu-trigger');
    await user.press(trigger);
    await user.press(screen.getByTestId('menu-view-child'));

    expect(onEdit).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(trigger.props.accessibilityState.expanded).toBe(false));
  });
});
