import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import {
  setIsAppShuted,
  setIsTooMuchSpeed,
  setTooMuchSpeed,
  setTooMuchSpeedTimestamp,
} from '@R/slices/location/location';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { ACTIVITY_ERROR_MSG } from './const';
import ActivityErrorMsg from './error-msg';

describe('Activity-error-msg', () => {
  it('shows the abnormal point time and can be dismissed', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setIsTooMuchSpeed(true));
    mockStore.dispatch(setTooMuchSpeed(60));
    mockStore.dispatch(setTooMuchSpeedTimestamp(new Date(2026, 7, 16, 12, 34, 56).getTime()));
    await renderWithProviders(<ActivityErrorMsg />, { store: mockStore });

    expect(screen.getByText(/12:34:56/)).toBeOnTheScreen();
    await user.press(screen.getByTestId('dismiss-too-much-speed'));
    expect(screen.queryByTestId('dismiss-too-much-speed')).not.toBeOnTheScreen();
  });

  it('should correctly render error message in russian, when initially', async () => {
    mockStore.dispatch(setIsAppShuted(true));
    await renderWithProviders(<ActivityErrorMsg />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_ERROR_MSG.russian.errorMsg)).toBeOnTheScreen();
  });
  it('should renders in russian, when the user switched to another language', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ActivityErrorMsg />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_ERROR_MSG.english.errorMsg)).toBeOnTheScreen();
  });
});
