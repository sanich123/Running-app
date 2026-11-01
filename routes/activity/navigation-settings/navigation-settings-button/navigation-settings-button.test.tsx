import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import {
  setNavigationAlertDistanceMeters,
  setNavigationAlertRepeatIntervalMinutes,
  setNavigationAlertsMuted,
} from '@R/slices/settings/settings';
import {
  DEFAULT_NAVIGATION_ALERT_DISTANCE_METERS,
  DEFAULT_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES,
} from '@R/slices/settings/types';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import NavigationSettingsButton from './navigation-settings-button';

describe('NavigationSettingsButton', () => {
  beforeEach(() => {
    mockStore.dispatch(setNavigationAlertDistanceMeters(DEFAULT_NAVIGATION_ALERT_DISTANCE_METERS));
    mockStore.dispatch(setNavigationAlertRepeatIntervalMinutes(DEFAULT_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES));
    mockStore.dispatch(setNavigationAlertsMuted(false));
  });

  it('provides route distance, repeat interval and voice alert controls', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<NavigationSettingsButton />);

    expect(screen.getByTestId('activity-navigation-settings-button')).toBeOnTheScreen();
    await user.press(screen.getByTestId('activity-navigation-settings-button'));
    expect(screen.getByTestId('activity-navigation-settings-button')).toBeOnTheScreen();
    expect(screen.getByText('Настройки навигации')).toBeOnTheScreen();
    expect(screen.getByTestId('navigation-alert-distance-value')).toHaveTextContent('50 м');
    expect(screen.getByTestId('navigation-alert-repeat-interval-value')).toHaveTextContent('1 мин');
    expect(mockStore.getState().settings.navigationAlertsMuted).toBe(false);

    await user.press(screen.getByTestId('increase-navigation-alert-distance'));
    expect(mockStore.getState().settings.navigationAlertDistanceMeters).toBe(60);
    expect(screen.getByTestId('navigation-alert-distance-value')).toHaveTextContent('60 м');

    await user.press(screen.getByTestId('increase-navigation-alert-interval'));
    expect(mockStore.getState().settings.navigationAlertRepeatIntervalMinutes).toBe(2);
    expect(screen.getByTestId('navigation-alert-repeat-interval-value')).toHaveTextContent('2 мин');

    await fireEvent(screen.getByTestId('navigation-alerts-enabled'), 'valueChange', false);
    expect(mockStore.getState().settings.navigationAlertsMuted).toBe(true);
  });

  it('renders native iOS stepper symbols in the settings sheet', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'ios');
    const user = userEvent.setup();
    try {
      await renderWithProviders(<NavigationSettingsButton />);
      await user.press(screen.getByTestId('activity-navigation-settings-button'));

      expect(screen.getByText('Настройки навигации')).toBeOnTheScreen();
      expect(screen.getByTestId('decrease-navigation-alert-distance')).toBeOnTheScreen();
      expect(screen.getByTestId('increase-navigation-alert-distance')).toBeOnTheScreen();
      expect(screen.getByTestId('decrease-navigation-alert-interval')).toBeOnTheScreen();
      expect(screen.getByTestId('increase-navigation-alert-interval')).toBeOnTheScreen();
    } finally {
      platform.restore();
    }
  });
});
