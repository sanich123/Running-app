import { screen } from '@testing-library/react-native';

import UserSportDate from './user-sport-date';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { formatDate, getHoursMinutes } from '../../utils/time-formatter';
import { SPORTS_BTNS_VALUES } from '../sports-btns/const';

describe('User sport date', () => {
  it('should correctly renders in english', async () => {
    const date = new Date();
    renderWithProviders(<UserSportDate sport={SPORTS_BTNS_VALUES.run} date={date} />, { store: mockStore });
    expect(screen.getByText(formatDate(date, LANGUAGES.english))).toBeOnTheScreen();
    expect(screen.getByText(getHoursMinutes(date, LANGUAGES.english))).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    const date = new Date();
    renderWithProviders(<UserSportDate sport={SPORTS_BTNS_VALUES.run} date={date} />, { store: mockStore });
    expect(screen.getByText(formatDate(date, LANGUAGES.russian))).toBeOnTheScreen();
    expect(screen.getByText(getHoursMinutes(date, LANGUAGES.russian))).toBeOnTheScreen();
  });
});
