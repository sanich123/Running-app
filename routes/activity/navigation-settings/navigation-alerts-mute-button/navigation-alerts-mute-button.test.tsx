import { screen, userEvent } from '@testing-library/react-native';
import { setNavigationAlertsMuted } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import NavigationAlertsMuteButton from './navigation-alerts-mute-button';

describe('NavigationAlertsMuteButton', () => {
  beforeEach(() => {
    mockStore.dispatch(setNavigationAlertsMuted(false));
  });

  it('mutes and unmutes route voice alerts', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<NavigationAlertsMuteButton />);

    expect(screen.getByLabelText('Выключить голосовые уведомления навигации')).toBeOnTheScreen();
    await user.press(screen.getByTestId('navigation-alerts-mute-button'));

    expect(mockStore.getState().settings.navigationAlertsMuted).toBe(true);
    expect(screen.getByLabelText('Включить голосовые уведомления навигации')).toBeOnTheScreen();
    expect(screen.getByTestId('navigation-alerts-mute-button').props.accessibilityState.selected).toBe(false);
  });
});
