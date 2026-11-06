import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentsEmptyList from './comments-empty-list';

describe('comments empty', () => {
  it('explains that the first comment can start the conversation', async () => {
    await renderWithProviders(<CommentsEmptyList />);
    expect(screen.getByText(EMPTY_STATE_COPY[LANGUAGES.russian].comments.title)).toBeOnTheScreen();
    expect(screen.getByText(EMPTY_STATE_COPY[LANGUAGES.russian].comments.message)).toBeOnTheScreen();
  });
});
