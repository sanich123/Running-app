import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import {
  setNavigationAlertDistanceMeters,
  setNavigationAlertRepeatIntervalMinutes,
  setNavigationAlertsMuted,
} from '@R/slices/activity-settings/activity-settings';
import {
  DEFAULT_NAVIGATION_ALERT_DISTANCE_METERS,
  DEFAULT_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES,
} from '@R/slices/activity-settings/types';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import NavigationSettingsPanel from './navigation-settings-panel';
import { NAVIGATION_SETTINGS_COPY } from '../const';

describe('NavigationSettingsPanel', () => {
  beforeEach(() => {
    mockStore.dispatch(setNavigationAlertDistanceMeters(DEFAULT_NAVIGATION_ALERT_DISTANCE_METERS));
    mockStore.dispatch(setNavigationAlertRepeatIntervalMinutes(DEFAULT_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES));
    mockStore.dispatch(setNavigationAlertsMuted(false));
  });

  it('provides route distance, repeat interval and voice alert controls', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<NavigationSettingsPanel />);

    expect(screen.getByText(NAVIGATION_SETTINGS_COPY[LANGUAGES.russian].title)).toBeOnTheScreen();
    expect(screen.getByTestId('navigation-alert-distance-value')).toHaveTextContent('50 м');
    expect(screen.getByTestId('navigation-alert-repeat-interval-value')).toHaveTextContent('1 мин');
    expect(screen.queryByTestId('navigation-haptics-enabled')).toBeNull();
    expect(mockStore.getState().activitySettings.navigationAlertsMuted).toBe(false);
    expect(mockStore.getState().activitySettings.navigationHapticsEnabled).toBe(false);

    await user.press(screen.getByTestId('increase-navigation-alert-distance'));
    expect(mockStore.getState().activitySettings.navigationAlertDistanceMeters).toBe(60);
    expect(screen.getByTestId('navigation-alert-distance-value')).toHaveTextContent('60 м');

    await user.press(screen.getByTestId('increase-navigation-alert-interval'));
    expect(mockStore.getState().activitySettings.navigationAlertRepeatIntervalMinutes).toBe(2);
    expect(screen.getByTestId('navigation-alert-repeat-interval-value')).toHaveTextContent('2 мин');

    await fireEvent(screen.getByTestId('navigation-alerts-enabled'), 'valueChange', false);
    expect(mockStore.getState().activitySettings.navigationAlertsMuted).toBe(true);
  });

  it('renders native iOS stepper symbols in the navigation settings panel', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'ios');
    try {
      await renderWithProviders(<NavigationSettingsPanel />);

      expect(screen.getByText(NAVIGATION_SETTINGS_COPY[LANGUAGES.russian].title)).toBeOnTheScreen();
      expect(screen.getByTestId('decrease-navigation-alert-distance')).toBeOnTheScreen();
      expect(screen.getByTestId('increase-navigation-alert-distance')).toBeOnTheScreen();
      expect(screen.getByTestId('decrease-navigation-alert-interval')).toBeOnTheScreen();
      expect(screen.getByTestId('increase-navigation-alert-interval')).toBeOnTheScreen();
    } finally {
      platform.restore();
    }
  });

  it('renders Android stepper icons in the navigation settings panel', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'android');
    try {
      await renderWithProviders(<NavigationSettingsPanel />);

      expect(screen.getByTestId('decrease-navigation-alert-distance')).toBeOnTheScreen();
      expect(screen.getByTestId('increase-navigation-alert-distance')).toBeOnTheScreen();
      expect(screen.getByTestId('decrease-navigation-alert-interval')).toBeOnTheScreen();
      expect(screen.getByTestId('increase-navigation-alert-interval')).toBeOnTheScreen();
    } finally {
      platform.restore();
    }
  });
});
