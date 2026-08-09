import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import SettingsRow from './settings-row';

describe('settings row', () => {
  it('runs the supplied setting action when pressed', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderWithProviders(<SettingsRow title="Test setting" onPress={onPress} />);
    await user.press(screen.getByText('Test setting'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
