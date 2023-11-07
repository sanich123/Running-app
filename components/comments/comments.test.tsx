import { screen } from '@testing-library/react-native';

import Comments from './comments';
import { MOCK_COMMENTS } from '../../tests/mocks/mock-comments';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { formatDate, getHoursMinutes } from '../../utils/time-formatter';

describe('Comments', () => {
  it('should correctly renders with isLoading state and data from server', async () => {
    renderWithProviders(<Comments id="someActivityId" />, { store: mockStore });
    expect(screen.getByTestId('commentsActivityIndicator')).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_COMMENTS[0].comment)).toBeOnTheScreen();
    expect(await screen.findByText(formatDate(new Date(MOCK_COMMENTS[0].date)))).toBeOnTheScreen();
    expect(await screen.findByText(getHoursMinutes(new Date(MOCK_COMMENTS[0].date)))).toBeOnTheScreen();
    expect(await screen.findByText('4 gave like'));
  });
  it('should correctly handle when an error occured', async () => {
    renderWithProviders(<Comments id="someWrongActivityId" />, { store: mockStore });
    expect(screen.getByTestId('commentsActivityIndicator')).toBeOnTheScreen();
    expect(await screen.findByText('An error occured')).toBeOnTheScreen();
    expect(await screen.findByText('Bad request, 401 code')).toBeOnTheScreen();
  });
});
