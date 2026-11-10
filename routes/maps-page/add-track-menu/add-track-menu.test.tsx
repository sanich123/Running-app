import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import AddTrackMenu from './add-track-menu';

describe('AddTrackMenu', () => {
  it('opens the selected add-track action', async () => {
    const user = userEvent.setup();
    const onAddFromWorkouts = jest.fn();
    const onUploadTrack = jest.fn();
    await renderWithProviders(
      <AddTrackMenu
        accessibilityLabel="Add track"
        fromWorkoutsLabel="From my workouts"
        uploadTrackLabel="Upload track"
        onAddFromWorkouts={onAddFromWorkouts}
        onUploadTrack={onUploadTrack}
      />,
    );

    await user.press(screen.getByTestId('routes-add-action'));
    await user.press(await screen.findByTestId('routes-upload-track'));

    expect(onUploadTrack).toHaveBeenCalledTimes(1);
    expect(onAddFromWorkouts).not.toHaveBeenCalled();
  });

  it('routes the workout action to its callback', async () => {
    const user = userEvent.setup();
    const onAddFromWorkouts = jest.fn();
    await renderWithProviders(
      <AddTrackMenu
        accessibilityLabel="Add track"
        fromWorkoutsLabel="From my workouts"
        uploadTrackLabel="Upload track"
        onAddFromWorkouts={onAddFromWorkouts}
        onUploadTrack={jest.fn()}
      />,
    );

    await user.press(screen.getByTestId('routes-add-action'));
    await user.press(await screen.findByTestId('routes-add-from-workouts'));

    expect(onAddFromWorkouts).toHaveBeenCalledTimes(1);
  });
});
