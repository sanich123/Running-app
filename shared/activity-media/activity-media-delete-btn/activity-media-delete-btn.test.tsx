import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityMediaDeleteBtn from './activity-media-delete-btn';

describe('ActivityMediaDeleteBtn', () => {
  it('calls the delete handler when the enabled button is pressed', async () => {
    const onDelete = jest.fn();
    await renderWithProviders(<ActivityMediaDeleteBtn onDelete={onDelete} isDeleting={false} />);

    fireEvent.press(screen.getByRole('button', { name: 'Удалить медиа' }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
