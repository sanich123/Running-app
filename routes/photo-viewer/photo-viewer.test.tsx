import { act, fireEvent, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  useGetActivityByActivityIdQuery,
  useGetAllActivityMediaByUserIdInfiniteQuery,
} from '@R/services/activity/activity';
import { renderWithProviders } from '@T/utils/test-utils';
import PhotoViewer from './photo-viewer';

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockUseActivity = useGetActivityByActivityIdQuery as jest.Mock;
const mockUsePhotos = useGetAllActivityMediaByUserIdInfiniteQuery as jest.Mock;
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({ back: jest.fn() })),
}));
jest.mock('@R/services/activity/activity', () => ({
  useGetActivityByActivityIdQuery: jest.fn(() => ({ data: undefined })),
  useGetAllActivityMediaByUserIdInfiniteQuery: jest.fn(() => ({
    data: undefined,
    fetchNextPage: jest.fn(),
    isFetching: false,
  })),
}));
jest.mock('@S/custom-image/custom-image', () => ({
  __esModule: true,
  default: ({ source, ...props }: { source: { uri: string }; contentFit?: string }) => {
    const { Text } = require('react-native');
    return (
      <Text testID="photo-viewer-image" {...props}>
        {source.uri}
      </Text>
    );
  },
}));
jest.mock('./video-viewer/video-viewer', () => ({
  __esModule: true,
  default: ({ url, isActive }: { url: string; isActive: boolean }) => {
    const { Text } = require('react-native');
    return (
      <Text testID="photo-viewer-video" accessibilityHint={isActive ? 'active' : 'inactive'}>
        {url}
      </Text>
    );
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
        media: [
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
    const video = screen.getByTestId('photo-viewer-video');
    expect(video.props.children).toBe('mp4');
    expect(video.props.accessibilityHint).toBe('active');

    const pager = screen.getByTestId('photo-viewer-pager');
    await act(async () => pager.props.onPageScrollStateChanged({ nativeEvent: { pageScrollState: 'dragging' } }));
    expect(screen.getByTestId('photo-viewer-video').props.accessibilityHint).toBe('inactive');
    await act(async () => pager.props.onPageScrollStateChanged({ nativeEvent: { pageScrollState: 'idle' } }));
    expect(screen.getByTestId('photo-viewer-video').props.accessibilityHint).toBe('active');

    await act(async () => pager.props.onPageSelected({ nativeEvent: { position: 0 } }));
    expect(screen.getByTestId('photo-viewer-video').props.accessibilityHint).toBe('inactive');
  });

  it('fits landscape native photos to the display width without cropping them', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockUseLocalSearchParams.mockReturnValue({ photoUrl: '0', indexOfPhoto: '0', take: '2' });
    mockUseActivity.mockReturnValue({ data: undefined });
    mockUsePhotos.mockReturnValue({
      data: {
        pages: [{ media: [{ url: 'https://cdn.example.com/landscape.jpg', blurhash: null }], hasMore: false }],
      },
      fetchNextPage: jest.fn(),
      isFetching: false,
    });

    await renderWithProviders(<PhotoViewer />);

    const image = screen.getByTestId('photo-viewer-image');
    expect(image).toHaveProp('contentFit', 'contain');
    await fireEvent(image, 'load', { source: { width: 1600, height: 900 } });
    expect(image).toHaveProp('contentFit', 'contain');
  });

  it('keeps portrait native photos covering the viewer after dimensions load', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockUseLocalSearchParams.mockReturnValue({ photoUrl: '0', indexOfPhoto: '0', take: '2' });
    mockUseActivity.mockReturnValue({ data: undefined });
    mockUsePhotos.mockReturnValue({
      data: {
        pages: [{ media: [{ url: 'https://cdn.example.com/portrait.jpg', blurhash: null }], hasMore: false }],
      },
      fetchNextPage: jest.fn(),
      isFetching: false,
    });

    await renderWithProviders(<PhotoViewer />);

    const image = screen.getByTestId('photo-viewer-image');
    await fireEvent(image, 'load', { source: { width: 900, height: 1600 } });
    expect(image).toHaveProp('contentFit', 'cover');
  });

  it('renders native user photos without an activity map offset', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockUseLocalSearchParams.mockReturnValue({ photoUrl: '0', indexOfPhoto: '0', take: '2' });
    mockUseActivity.mockReturnValue({ data: undefined });
    mockUsePhotos.mockReturnValue({
      data: {
        pages: [
          {
            media: [
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
