import { SPORTS_BTNS_VALUES } from '@C/sports-btns/const';
import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import UserSportDate from './user-sport-date';

describe('User sport date', () => {
  it('should correctly renders in english', async () => {
    const date = `${new Date()}`;
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<UserSportDate sport={SPORTS_BTNS_VALUES.run} date={date} />, { store: mockStore });
    expect(screen.getByText(new RegExp(formatDate(date, LANGUAGES.english)))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(getHoursMinutes(date, LANGUAGES.english)))).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<UserSportDate sport={SPORTS_BTNS_VALUES.run} date={`${new Date()}`} />, { store: mockStore });
    expect(screen.getByText(new RegExp(formatDate(`${new Date()}`, LANGUAGES.russian)))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(getHoursMinutes(`${new Date()}`, LANGUAGES.russian)))).toBeOnTheScreen();
  });
});
