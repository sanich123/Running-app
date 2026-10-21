import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import SwitchRow from './switch-row';

describe('SwitchRow', () => {
  it('shows the current value and reports changes', async () => {
    const onValueChange = jest.fn();
    await renderWithProviders(<SwitchRow label="Notifications" value={false} onValueChange={onValueChange} />);

    fireEvent(screen.getByRole('switch'), 'valueChange', true);

    expect(screen.getByText('Notifications')).toBeOnTheScreen();
    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});
