import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import VideoExportLoader from './video-export-loader';

describe('VideoExportLoader', () => {
  it('shows progress and lets the user cancel the export', async () => {
    const onCancel = jest.fn();
    await renderWithProviders(
      <VideoExportLoader visible title="Exporting" message="Please wait" cancelLabel="Cancel" onCancel={onCancel} />,
    );

    expect(screen.getByText('Exporting')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('activity-route-replay-cancel-export'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
