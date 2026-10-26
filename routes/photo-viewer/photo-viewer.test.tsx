import { act, fireEvent, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  useGetActivityByActivityIdQuery,
  useGetAllActivityMediaByUserIdInfiniteQuery,
} from '@R/services/activity/activity';
import { TEST_URLS } from '@T/mocks/const';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import PhotoViewer from './photo-viewer';
import type { MockNativeViewProps } from '@T/utils/mock-native-view';
import type * as MockNativeViewTools from '@T/utils/mock-native-view';

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
  const { createMockNativeView } = require('@T/utils/mock-native-view') as typeof MockNativeViewTools;
  return ({ children, ...props }: MockNativeViewProps) => createMockNativeView(props, children, 'photo-viewer-pager');
});

describe('photo viewer', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  });

  it('decodes a web image URL before rendering it', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      photoUrl: encodeURIComponent(TEST_URLS.routeRunPhoto),
      blurhash: 'photo-blurhash',
    });
    await renderWithProviders(<PhotoViewer />);
    const image = screen.getByTestId('photo-viewer-image');
    expect(image).toHaveTextContent(TEST_URLS.routeRunPhoto);
    expect(image).toHaveProp('placeholder', 'photo-blurhash');
  });

  it('renders video URLs with the video viewer', async () => {
    mockUseLocalSearchParams.mockReturnValue({ photoUrl: TEST_URLS.routeRunVideo });
    await renderWithProviders(<PhotoViewer />);
    expect(screen.getByTestId('photo-viewer-video')).toHaveTextContent(TEST_URLS.routeRunVideo);
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
          { url: TEST_URLS.routeRunPhoto, blurhash: 'blurhash' },
          { url: 'mp4', blurhash: null },
        ],
      },
    });
    mockUsePhotos.mockReturnValue({ data: undefined, fetchNextPage: jest.fn(), isFetching: false });

    await renderWithProviders(<PhotoViewer />);

    expect(screen.getByTestId('photo-viewer-pager').props.initialPage).toBe(1);
    expect(screen.getAllByTestId('photo-viewer-image').map((element) => element.props.children)).toContain(
      TEST_URLS.routeRunPhoto,
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
              { url: TEST_URLS.routePhoto, blurhash: 'blurhash' },
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
      TEST_URLS.routePhoto,
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

  it('shows activity media stage icons to viewers', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    mockUseLocalSearchParams.mockReturnValue({
      photoUrl: '550e8400-e29b-41d4-a716-446655440000',
      indexOfPhoto: '0',
    });
    mockUsePhotos.mockReturnValue({ data: undefined, fetchNextPage: jest.fn(), isFetching: false });
    mockUseActivity.mockReturnValue({
      data: {
        userId: 'photo-owner',
        media: [{ url: TEST_URLS.reviewPhoto, mediaReviewStatus: 'review_required' }],
      },
    });

    await act(async () => mockStore.dispatch(setMockUserId('viewer-id')));
    await renderWithProviders(<PhotoViewer />);
    expect(screen.getByTestId('media-moderation-placeholder')).toBeOnTheScreen();
  });

  it('hides activity media stage icons from the owner in the photo viewer', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    mockUseLocalSearchParams.mockReturnValue({
      photoUrl: '550e8400-e29b-41d4-a716-446655440000',
      indexOfPhoto: '0',
    });
    mockUsePhotos.mockReturnValue({ data: undefined, fetchNextPage: jest.fn(), isFetching: false });
    mockUseActivity.mockReturnValue({
      data: {
        userId: 'photo-owner',
        media: [{ url: TEST_URLS.reviewPhoto, mediaReviewStatus: 'review_required' }],
      },
    });
    await act(async () => mockStore.dispatch(setMockUserId('photo-owner')));
    await renderWithProviders(<PhotoViewer />);
    expect(screen.queryByTestId('media-moderation-placeholder')).not.toBeOnTheScreen();
  });
});
