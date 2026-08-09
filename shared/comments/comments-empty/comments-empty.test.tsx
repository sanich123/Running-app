import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentsEmptyList from './comments-empty';

describe('comments empty', () => {
  it('explains that the first comment can start the conversation', async () => {
    await renderWithProviders(<CommentsEmptyList />);
    expect(screen.getByText('Комментариев пока нет')).toBeOnTheScreen();
    expect(screen.getByText('Оставьте первый комментарий и начните разговор.')).toBeOnTheScreen();
  });
});
