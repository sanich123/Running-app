import { changeLanguage } from '@R/language/language';
import { setIsAppShuted } from '@R/location/location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import ActivityErrorMsg from './error-msg';
import { ACTIVITY_ERROR_MSG } from './const';

describe('Activity-error-msg', () => {
  it('should correctly render error message in russian, when initially', () => {
    mockStore.dispatch(setIsAppShuted(true));
    renderWithProviders(<ActivityErrorMsg />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_ERROR_MSG.russian.errorMsg)).toBeOnTheScreen();
  });
  it('should renders in russian, when the user switched to another language', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<ActivityErrorMsg />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_ERROR_MSG.english.errorMsg)).toBeOnTheScreen();
  });
});
