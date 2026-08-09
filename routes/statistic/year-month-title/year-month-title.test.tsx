import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import YearMonthTitle from './year-month-title';

describe('year month title', () => {
  it('formats the month according to the selected language', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<YearMonthTitle year="2025" month="0" />);
    expect(screen.getByText('January 2025')).toBeOnTheScreen();
  });
});
