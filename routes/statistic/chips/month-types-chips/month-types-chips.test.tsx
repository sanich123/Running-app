import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { MONTH_TYPES_CHIPS_COPY } from './const';
import MonthTypesChips from './month-types-chips';

const setSelectedType = jest.fn();
const props = { typesOfSport: ['run', 'walk'], selectedType: 'all', setSelectedType };

describe('MonthTypesChips', () => {
  beforeEach(() => mockStore.dispatch(changeLanguage(LANGUAGES.english)));
  it('renders available sports and changes the selected type', async () => {
    await renderWithProviders(<MonthTypesChips {...props} />);
    expect(screen.getByText(MONTH_TYPES_CHIPS_COPY[LANGUAGES.english].sport)).toBeOnTheScreen();
    fireEvent.press(await screen.findByText(SPORTS_BTNS_VALUES.walk));
    expect(setSelectedType).toHaveBeenCalledWith(SPORTS_BTNS_VALUES.walk);
  });
  it('shows translated sport labels in Russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<MonthTypesChips {...props} />);
    expect(screen.getByText(MONTH_TYPES_CHIPS_COPY[LANGUAGES.russian].sport)).toBeOnTheScreen();
    expect(screen.getByText(MAP_SPORT_TO_TITLE[SPORTS_BTNS_VALUES.run][LANGUAGES.russian])).toBeOnTheScreen();
  });
});
