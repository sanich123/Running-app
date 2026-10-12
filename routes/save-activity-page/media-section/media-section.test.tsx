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

    expect(screen.getByText('Фото и видео')).toBeOnTheScreen();
    expect(screen.getByTestId('imagePreview-0')).toBeOnTheScreen();
    expect(screen.getByTestId('deleteIcon')).toBeOnTheScreen();
    expect(screen.queryByTestId('upload-gallery-button')).toBeNull();
    expect(screen.queryByTestId('show-camera-button')).toBeNull();
  });
});
