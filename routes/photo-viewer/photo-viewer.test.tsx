import { screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { renderWithProviders } from '@T/utils/test-utils';
import PhotoViewer from './photo-viewer';

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
jest.mock('expo-router', () => ({ useLocalSearchParams: jest.fn() }));
jest.mock('@R/services/activity/activity', () => ({
  useGetActivityByActivityIdQuery: jest.fn(() => ({ data: undefined })),
  useGetAllActivityPhotosByUserIdQuery: jest.fn(() => ({ data: undefined })),
}));
jest.mock('@S/custom-image/custom-image', () => ({
  CustomImage: ({ source }: { source: { uri: string } }) => {
    const { Text } = require('react-native');
    return <Text testID="photo-viewer-image">{source.uri}</Text>;
  },
}));
jest.mock('./video-viewer/video-viewer', () => ({
  __esModule: true,
  default: ({ url }: { url: string }) => {
    const { Text } = require('react-native');
    return <Text testID="photo-viewer-video">{url}</Text>;
  },
}));

describe('photo viewer', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  });

  it('decodes a web image URL before rendering it', async () => {
    mockUseLocalSearchParams.mockReturnValue({ photoUrl: encodeURIComponent('https://cdn.example.com/run.jpg') });
    await renderWithProviders(<PhotoViewer />);
    expect(screen.getByTestId('photo-viewer-image')).toHaveTextContent('https://cdn.example.com/run.jpg');
  });

  it('renders video URLs with the video viewer', async () => {
    mockUseLocalSearchParams.mockReturnValue({ photoUrl: 'https://cdn.example.com/run.mp4' });
    await renderWithProviders(<PhotoViewer />);
    expect(screen.getByTestId('photo-viewer-video')).toHaveTextContent('https://cdn.example.com/run.mp4');
    expect(screen.queryByTestId('photo-viewer-image')).not.toBeOnTheScreen();
  });
});
