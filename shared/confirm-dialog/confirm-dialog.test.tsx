import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ConfirmDialog from './confirm-dialog';

const mockDialog = { title: 'Delete activity', message: 'This cannot be undone', confirm: 'Delete' };

describe('ConfirmDialog', () => {
  it('renders supplied content and confirms', async () => {
    const onConfirm = jest.fn();
    await renderWithProviders(
      <ConfirmDialog
        visible
        title={mockDialog.title}
        message={mockDialog.message}
        confirmText={mockDialog.confirm}
        onConfirm={onConfirm}
        onDismiss={jest.fn()}
      />,
    );
    expect(screen.getByText(mockDialog.title)).toBeOnTheScreen();
    fireEvent.press(screen.getByText(mockDialog.confirm));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
