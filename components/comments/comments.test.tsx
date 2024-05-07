import { screen } from '@testing-library/react-native';

import Comments from './comments';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { MOCK_COMMENTS } from '../../tests/mocks/mock-comments';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { formatDate, getHoursMinutes } from '../../utils/time-formatter';
import { NUMBER_OF_LIKES } from '../number-of-likes/const';

describe('Comments', () => {
  it('should correctly renders with isLoading state and data from server in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<Comments id="someActivityId" />, { store: mockStore });
    expect(screen.getByTestId('commentsActivityIndicator')).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_COMMENTS[0].comment)).toBeOnTheScreen();
    expect(await screen.findByText(formatDate(new Date(MOCK_COMMENTS[0].date), LANGUAGES.english))).toBeOnTheScreen();
    expect(
      await screen.findByText(getHoursMinutes(new Date(MOCK_COMMENTS[0].date), LANGUAGES.english)),
    ).toBeOnTheScreen();
    expect(await screen.findByText(new RegExp(`4 ${NUMBER_OF_LIKES.english.manyGaveLikes}`))).toBeOnTheScreen();
  });
  it('should correctly renders with data from server in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<Comments id="someActivityId" />, { store: mockStore });
    expect(await screen.findByText(MOCK_COMMENTS[0].comment)).toBeOnTheScreen();
    expect(await screen.findByText(formatDate(new Date(MOCK_COMMENTS[0].date), LANGUAGES.russian))).toBeOnTheScreen();
    expect(
      await screen.findByText(getHoursMinutes(new Date(MOCK_COMMENTS[0].date), LANGUAGES.russian)),
    ).toBeOnTheScreen();
    expect(await screen.findByText(new RegExp(`4 ${NUMBER_OF_LIKES.russian.manyGaveLikes}`))).toBeOnTheScreen();
  });
  it('should correctly handle when an error occured', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<Comments id="someWrongActivityId" />, { store: mockStore });
    expect(screen.getByTestId('commentsActivityIndicator')).toBeOnTheScreen();
    expect(await screen.findByText('An error occured')).toBeOnTheScreen();
    expect(await screen.findByText('Bad request, 401 code')).toBeOnTheScreen();
  });
});
