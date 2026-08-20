import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentsLoadMoreBtn from './comments-load-more';

describe('comments load more', () => {
  it('retries a failed comments page', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderWithProviders(
      <CommentsLoadMoreBtn onPress={onPress} isLoading={false} isError />,
    );
    await user.press(screen.getByTestId('comments-load-more'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
