import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { setIsAppShuted } from '@R/slices/location/location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { ACTIVITY_ERROR_MSG } from './const';
import ActivityErrorMsg from './error-msg';

describe('Activity-error-msg', () => {
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
