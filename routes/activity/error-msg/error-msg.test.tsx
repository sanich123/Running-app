import { act, screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import {
  setIsAppShuted,
  setIsMapVisible,
  setIsTooMuchSpeed,
  setTooMuchSpeed,
  setTooMuchSpeedTimestamp,
} from '@R/slices/location/location';
import { changeLanguage } from '@R/slices/settings/settings';
import { createMockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { ACTIVITY_ERROR_MSG, NO_SPEED_ALERT_TIME } from './const';
import ActivityErrorMsg from './error-msg';

describe('Activity-error-msg', () => {
  let testStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    testStore = createMockStore();
    testStore.dispatch(setIsMapVisible(true));
    testStore.dispatch(changeLanguage(LANGUAGES.russian));
  });

  it('shows the abnormal point time and can be dismissed', async () => {
    const user = userEvent.setup();
    testStore.dispatch(setIsTooMuchSpeed(true));
    testStore.dispatch(setTooMuchSpeed(60));
    testStore.dispatch(setTooMuchSpeedTimestamp(new Date(2026, 7, 16, 12, 34, 56).getTime()));
    await renderWithProviders(<ActivityErrorMsg />, { store: testStore });

    expect(screen.getByText(/12:34:56/)).toBeOnTheScreen();
    await user.press(screen.getByTestId('dismiss-too-much-speed'));
    expect(screen.queryByTestId('dismiss-too-much-speed')).not.toBeOnTheScreen();
  });

  it('formats the abnormal point time for English', async () => {
    testStore.dispatch(changeLanguage(LANGUAGES.english));
    testStore.dispatch(setIsTooMuchSpeed(true));
    testStore.dispatch(setTooMuchSpeed(60));
    testStore.dispatch(setTooMuchSpeedTimestamp(new Date(2026, 7, 16, 12, 34, 56).getTime()));
    await renderWithProviders(<ActivityErrorMsg />, { store: testStore });

    expect(screen.getByText(/12:34:56/)).toBeOnTheScreen();

    await act(async () => {
      testStore.dispatch(changeLanguage(LANGUAGES.russian));
    });
  });

  it('shows a placeholder when the abnormal point has no timestamp', async () => {
    testStore.dispatch(setIsTooMuchSpeed(true));
    testStore.dispatch(setTooMuchSpeed(60));
    testStore.dispatch(setTooMuchSpeedTimestamp(null));
    expect(testStore.getState().location).toMatchObject({
      isMapVisible: true,
      isTooMuchSpeed: true,
      tooMuchSpeed: 60,
      tooMuchSpeedTimestamp: null,
    });
    await renderWithProviders(<ActivityErrorMsg />, { store: testStore });
    expect(screen.getByText(new RegExp(NO_SPEED_ALERT_TIME))).toBeOnTheScreen();
  });

  it('should correctly render error message in russian, when initially', async () => {
    testStore.dispatch(setIsAppShuted(true));
    expect(testStore.getState().location).toMatchObject({ isMapVisible: true, isAppShutedByPhone: true });
    await renderWithProviders(<ActivityErrorMsg />, { store: testStore });
    expect(screen.getByText(ACTIVITY_ERROR_MSG.russian.errorMsg)).toBeOnTheScreen();
  });
  it('should renders in russian, when the user switched to another language', async () => {
    testStore.dispatch(changeLanguage(LANGUAGES.english));
    testStore.dispatch(setIsAppShuted(true));
    await renderWithProviders(<ActivityErrorMsg />, { store: testStore });
    expect(screen.getByText(ACTIVITY_ERROR_MSG.english.errorMsg)).toBeOnTheScreen();
  });

  it('allows the tracking recovery notification to be dismissed', async () => {
    const user = userEvent.setup();
    testStore.dispatch(setIsAppShuted(true));
    await renderWithProviders(<ActivityErrorMsg />, { store: testStore });

    await user.press(screen.getByTestId('dismiss-tracking-paused'));

    expect(screen.queryByTestId('dismiss-tracking-paused')).not.toBeOnTheScreen();
  });
});
