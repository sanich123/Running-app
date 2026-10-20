import { screen } from '@testing-library/react-native';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import MediaSection from './media-section';

describe('MediaSection', () => {
  it('shows photos and videos with delete controls when editing an activity', async () => {
    await renderWithProviders(
      <MediaSection
        images={[
          {
            id: 'media-id',
            activityId: 'activity-id',
            url: 'https://cdn.example.test/video.mp4',
            thumbnail: 'https://cdn.example.test/video-thumbnail.jpg',
          },
        ]}
        isEditingActivity
        activityId="activity-id"
        setImages={jest.fn()}
      />,
      { store: mockStore },
    );

    expect(screen.queryByText('Фото и видео')).not.toBeOnTheScreen();
    expect(screen.getByTestId('imagePreview-0')).toBeOnTheScreen();
    expect(screen.getByTestId('deleteIcon')).toBeOnTheScreen();
    expect(screen.getByTestId('upload-gallery-button')).toBeOnTheScreen();
    expect(screen.getByTestId('show-camera-button')).toBeOnTheScreen();
  });

  it('shows gallery and camera controls for an edited activity with no media', async () => {
    await renderWithProviders(
      <MediaSection images={[]} isEditingActivity activityId="activity-id" setImages={jest.fn()} />,
      { store: mockStore },
    );

    expect(screen.queryByText('Фото и видео')).not.toBeOnTheScreen();
    expect(screen.getByTestId('upload-gallery-button')).toBeOnTheScreen();
    expect(screen.getByTestId('show-camera-button')).toBeOnTheScreen();
    expect(screen.getByText('Можно добавить до 5 фото или видео. Видео — до 1 минуты')).toBeOnTheScreen();
  });

  it('disables both upload entry points after five media files are attached', async () => {
    await renderWithProviders(
      <MediaSection
        images={Array.from({ length: 5 }, (_, index) => ({ url: `https://cdn/${index}.jpg`, thumbnail: null }))}
        isEditingActivity
        activityId="activity-id"
        setImages={jest.fn()}
      />,
      { store: mockStore },
    );

    expect(screen.getByTestId('upload-gallery-button')).toBeDisabled();
    expect(screen.getByTestId('show-camera-button')).toBeDisabled();
  });
});
