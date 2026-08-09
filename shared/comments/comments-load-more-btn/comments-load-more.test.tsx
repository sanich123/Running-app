import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentsLoadMoreBtn from './comments-load-more';

describe('comments load more', () => {
  it('requests the next ten comments', async () => {
    const user = userEvent.setup();
    const increaseTakeNumber = jest.fn();
    await renderWithProviders(
      <CommentsLoadMoreBtn take={10} commentsLength={27} increaseTakeNumber={increaseTakeNumber} />,
    );
    await user.press(screen.getByTestId('comments-load-more'));
    expect(increaseTakeNumber).toHaveBeenCalledWith(20);
  });
});
