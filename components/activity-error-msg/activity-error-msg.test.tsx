import { screen } from '@testing-library/react-native';

import ActivityErrorMsg from './activity-error-msg';
import { ACTIVITY_ERROR_MSG } from './const';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { setIsAppShuted } from '../../redux/location/location';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Activity-error-msg', () => {
  it('should correctly render error message in english, when initially', () => {
    mockStore.dispatch(setIsAppShuted(true));
    renderWithProviders(<ActivityErrorMsg />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_ERROR_MSG.english.errorMsg)).toBeOnTheScreen();
  });
  it('should renders in russian, when the user switched to another language', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<ActivityErrorMsg />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_ERROR_MSG.russian.errorMsg)).toBeOnTheScreen();
  });
});
