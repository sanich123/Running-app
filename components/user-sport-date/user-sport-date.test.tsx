import { screen } from '@testing-library/react-native';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import UserSportDate from './user-sport-date';

describe('User sport date', () => {
  it('should correctly renders in english', async () => {
    const date = `${new Date()}`;
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<UserSportDate sport={SPORTS_BTNS_VALUES.run} date={date} />, { store: mockStore });
    expect(screen.getByText(new RegExp(formatDate(date, LANGUAGES.english)))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(getHoursMinutes(date, LANGUAGES.english)))).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<UserSportDate sport={SPORTS_BTNS_VALUES.run} date={`${new Date()}`} />, {
      store: mockStore,
    });
    expect(screen.getByText(new RegExp(formatDate(`${new Date()}`, LANGUAGES.russian)))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(getHoursMinutes(`${new Date()}`, LANGUAGES.russian)))).toBeOnTheScreen();
  });
});
