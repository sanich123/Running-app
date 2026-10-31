import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import DateFilters from './date-filters';
import { MAPS_PAGE_COPY } from '../../const';

describe('date filters', () => {
  it('reports a selected month to the owner', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const copy = MAPS_PAGE_COPY[LANGUAGES.english];
    await renderWithProviders(
      <DateFilters
        filters={{ month: null, day: null, year: null }}
        availableFilters={{ months: [6], days: [14], years: [2026] }}
        copy={copy}
        locale="en-US"
        onChange={onChange}
      />,
    );

    await user.press(screen.getByTestId('month-filter'));
    await user.press(await screen.findByText('June'));

    expect(onChange).toHaveBeenCalledWith('month', 6);
  });
});
