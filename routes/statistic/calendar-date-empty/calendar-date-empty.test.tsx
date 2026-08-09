import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import CalendarDateEmpty from './calendar-date-empty';

describe('calendar date empty', () => {
  it('does not render a value for an empty calendar cell', async () => {
    await renderWithProviders(<CalendarDateEmpty isTitle={false} isEmptyCell dateValue="12" />);
    expect(screen.queryByText('12')).not.toBeOnTheScreen();
  });

  it('renders a date value for a title cell', async () => {
    await renderWithProviders(<CalendarDateEmpty isTitle isEmptyCell={false} dateValue="Mon" />);
    expect(screen.getByText('Mon')).toBeOnTheScreen();
  });
});
