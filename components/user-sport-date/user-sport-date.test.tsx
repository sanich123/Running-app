import { screen } from '@testing-library/react-native';

import UserSportDate from './user-sport-date';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { formatDate, getHoursMinutes } from '../../utils/time-formatter';

describe('User sport date', () => {
  it('should correctly renders', async () => {
    const date = new Date();
    renderWithProviders(<UserSportDate sport="run" date={date} />, { store: mockStore });
    expect(screen.getByText(formatDate(date))).toBeOnTheScreen();
    expect(screen.getByText(getHoursMinutes(date))).toBeOnTheScreen();
  });
});
