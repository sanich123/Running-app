import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentsSkeleton from './comments-skeleton';

describe('CommentsSkeleton', () => {
  it('renders the loading placeholders for comments', async () => {
    await renderWithProviders(<CommentsSkeleton />);

    expect(screen.getByTestId('comments-skeleton')).toBeOnTheScreen();
  });
});
