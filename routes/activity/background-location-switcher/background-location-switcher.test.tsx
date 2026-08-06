import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import BackgroundLocationSwitcher from './background-location-switcher';

describe('background location switcher', () => {
  it('opens the background-location explanation', async () => {
    const user = userEvent.setup();
    const present = jest.fn();
    await renderWithProviders(
      <BackgroundLocationSwitcher
        backgroundPermissionStatus={false}
        backgroundLocationEnabledModalRef={{ current: { present } } as any}
      />,
    );
    await user.press(screen.getByTestId('background-location-details'));
    expect(present).toHaveBeenCalledTimes(1);
  });
});
