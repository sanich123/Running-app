import { screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  useGetActivityByActivityIdQuery,
  useGetAllActivityPhotosByUserIdInfiniteQuery,
} from '@R/services/activity/activity';
import { renderWithProviders } from '@T/utils/test-utils';
import PhotoViewer from './photo-viewer';

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockUseActivity = useGetActivityByActivityIdQuery as jest.Mock;
const mockUsePhotos = useGetAllActivityPhotosByUserIdInfiniteQuery as jest.Mock;
jest.mock('expo-router', () => ({ useLocalSearchParams: jest.fn() }));
jest.mock('@R/services/activity/activity', () => ({
  useGetActivityByActivityIdQuery: jest.fn(() => ({ data: undefined })),
  useGetAllActivityPhotosByUserIdInfiniteQuery: jest.fn(() => ({
    data: undefined,
    fetchNextPage: jest.fn(),
    isFetching: false,
  })),
}));
jest.mock('@S/custom-image/custom-image', () => ({
  __esModule: true,
  default: ({ source }: { source: { uri: string } }) => {
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
jest.mock('react-native-pager-view', () => {
  const { View } = jest.requireActual('react-native');
  return ({ children, ...props }: any) => (
    <View testID="photo-viewer-pager" {...props}>
      {children}
    </View>
  );
});

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

  it('renders native activity photos with map offset and mixed media', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    mockUseLocalSearchParams.mockReturnValue({
      photoUrl: '550e8400-e29b-41d4-a716-446655440000',
      indexOfPhoto: '2',
      userId: 'other-user',
      take: '4',
    });
    mockUseActivity.mockReturnValue({
      data: {
        mapPhotoUrl: 'https://cdn.example.com/map.jpg',
        photoVideoUrls: [
          { url: 'https://cdn.example.com/run.jpg', blurhash: 'blurhash' },
          { url: 'mp4', blurhash: null },
        ],
      },
    });
    mockUsePhotos.mockReturnValue({ data: undefined, fetchNextPage: jest.fn(), isFetching: false });

    await renderWithProviders(<PhotoViewer />);

    expect(screen.getByTestId('photo-viewer-pager').props.initialPage).toBe(1);
    expect(screen.getAllByTestId('photo-viewer-image').map((element) => element.props.children)).toContain(
      'https://cdn.example.com/run.jpg',
    );
    expect(screen.getAllByTestId('photo-viewer-video').map((element) => element.props.children)).toContain('mp4');
  });

  it('renders native user photos without an activity map offset', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockUseLocalSearchParams.mockReturnValue({ photoUrl: '0', indexOfPhoto: '0', take: '2' });
    mockUseActivity.mockReturnValue({ data: undefined });
    mockUsePhotos.mockReturnValue({
      data: {
        pages: [
          {
            photos: [
              { url: 'https://cdn.example.com/photo.jpg', blurhash: 'blurhash' },
              { url: 'webm', blurhash: null },
            ],
            hasMore: false,
            nextCursor: null,
          },
        ],
      },
      fetchNextPage: jest.fn(),
      isFetching: false,
    });

    await renderWithProviders(<PhotoViewer />);

    expect(screen.getByTestId('photo-viewer-pager').props.initialPage).toBe(0);
    expect(screen.getAllByTestId('photo-viewer-image').map((element) => element.props.children)).toContain(
      'https://cdn.example.com/photo.jpg',
    );
    expect(screen.getAllByTestId('photo-viewer-video').map((element) => element.props.children)).toContain('webm');
  });

  it('does not render a pager when a valid activity has no media', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    mockUseLocalSearchParams.mockReturnValue({
      photoUrl: '550e8400-e29b-41d4-a716-446655440000',
      indexOfPhoto: '0',
    });
    mockUseActivity.mockReturnValue({ data: {} });
    mockUsePhotos.mockReturnValue({ data: undefined, fetchNextPage: jest.fn(), isFetching: false });

    await renderWithProviders(<PhotoViewer />);

    expect(screen.queryByTestId('photo-viewer-pager')).not.toBeOnTheScreen();
  });
});
