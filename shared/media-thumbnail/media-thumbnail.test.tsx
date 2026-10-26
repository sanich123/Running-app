import { act, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import MediaThumbnail from './media-thumbnail';

let mockThumbnailOnError: (() => void) | undefined;

jest.mock('@S/custom-image/custom-image', () => {
  const { Text, View } = require('react-native');

  return {
    __esModule: true,
    default: ({ source, testID, onError }: { source: { uri: string }; testID: string; onError?: () => void }) => {
      mockThumbnailOnError = onError;
      return (
        <View testID={testID}>
          <Text>{source.uri}</Text>
        </View>
      );
    },
  };
});

describe('MediaThumbnail', () => {
  it('shows a default video image when no thumbnail is available', async () => {
    await renderWithProviders(<MediaThumbnail mediaUrl="https://cdn.example/video.mp4" testID="video-preview" />);

    expect(screen.getByTestId('video-preview-fallback')).toBeOnTheScreen();
    expect(screen.queryByTestId('video-preview')).not.toBeOnTheScreen();
  });

  it('switches to the default video image when the thumbnail fails to load', async () => {
    await renderWithProviders(
      <MediaThumbnail
        mediaUrl="https://cdn.example/video.mp4"
        thumbnail="https://cdn.example/video-thumbnail.jpg"
        testID="video-preview"
      />,
    );

    await act(async () => mockThumbnailOnError?.());

    expect(screen.getByTestId('video-preview-fallback')).toBeOnTheScreen();
  });

  it('keeps displaying a photo directly when it has no thumbnail', async () => {
    await renderWithProviders(<MediaThumbnail mediaUrl="https://cdn.example/photo.jpg" testID="photo-preview" />);

    expect(screen.getByTestId('photo-preview')).toHaveTextContent('https://cdn.example/photo.jpg');
    expect(screen.queryByTestId('photo-preview-fallback')).not.toBeOnTheScreen();
  });
});
