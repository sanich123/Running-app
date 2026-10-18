import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import HomeFeedSkeleton from './home-feed-skeleton';

describe('HomeFeedSkeleton', () => {
  it('renders the loading placeholders for the activity feed', async () => {
    await renderWithProviders(<HomeFeedSkeleton />);

    expect(screen.getByTestId('home-feed-skeleton')).toBeOnTheScreen();
  });
});
