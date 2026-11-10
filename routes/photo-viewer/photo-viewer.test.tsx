import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TEST_URLS } from '@T/mocks/const';
import { MOCK_SERVER_ACTIVITY } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { VIDEO_EXTENSIONS } from './const';
import PhotoViewer from './photo-viewer';
import type { MockNativeViewProps } from '@T/utils/mock-native-view';
import type * as MockNativeViewTools from '@T/utils/mock-native-view';

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({ back: jest.fn() })),
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
    mockStore.dispatch(setMockUserId('viewer-id'));
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
    server.use(
      http.get(`${BASE_URL}/activity/activityId/550e8400-e29b-41d4-a716-446655440000`, () =>
        HttpResponse.json({
          ...MOCK_SERVER_ACTIVITY,
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId: 'photo-owner',
          mapPhotoUrl: 'https://cdn.example.com/map.jpg',
          media: [
            { url: TEST_URLS.routeRunPhoto, thumbnail: null, blurhash: 'blurhash' },
            { url: 'mp4', thumbnail: null, blurhash: null },
          ],
        }),
      ),
      http.get(`${BASE_URL}/activity/other-user/media`, () => HttpResponse.json({ media: [], hasMore: false })),
    );

    await renderWithProviders(<PhotoViewer />);

    expect((await screen.findByTestId('photo-viewer-pager')).props.initialPage).toBe(1);
    expect(screen.getAllByTestId('photo-viewer-image').map((element) => element.props.children)).toContain(
      TEST_URLS.routeRunPhoto,
    );
    const video = screen.getByTestId('photo-viewer-video');
    expect(video.props.children).toBe(VIDEO_EXTENSIONS[8]);
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
    mockStore.dispatch(setMockUserId('photo-owner-landscape'));
    mockUseLocalSearchParams.mockReturnValue({ photoUrl: '0', indexOfPhoto: '0', take: '2' });
    server.use(
      http.get(`${BASE_URL}/activity/photo-owner-landscape/media`, () =>
        HttpResponse.json({
          media: [{ url: 'https://cdn.example.com/landscape.jpg', thumbnail: null, blurhash: null }],
          hasMore: false,
        }),
      ),
    );

    await renderWithProviders(<PhotoViewer />);

    const image = await screen.findByTestId('photo-viewer-image');
    expect(image).toHaveProp('contentFit', 'contain');
    await fireEvent(image, 'load', { source: { width: 1600, height: 900 } });
    expect(image).toHaveProp('contentFit', 'contain');
  });

  it('keeps portrait native photos covering the viewer after dimensions load', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockStore.dispatch(setMockUserId('photo-owner-portrait'));
    mockUseLocalSearchParams.mockReturnValue({ photoUrl: '0', indexOfPhoto: '0', take: '2' });
    server.use(
      http.get(`${BASE_URL}/activity/photo-owner-portrait/media`, () =>
        HttpResponse.json({
          media: [{ url: 'https://cdn.example.com/portrait.jpg', thumbnail: null, blurhash: null }],
          hasMore: false,
        }),
      ),
    );

    await renderWithProviders(<PhotoViewer />);

    const image = await screen.findByTestId('photo-viewer-image');
    await fireEvent(image, 'load', { source: { width: 900, height: 1600 } });
    expect(image).toHaveProp('contentFit', 'cover');
  });

  it('renders native user photos without an activity map offset', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockStore.dispatch(setMockUserId('photo-owner-normal'));
    mockUseLocalSearchParams.mockReturnValue({ photoUrl: '0', indexOfPhoto: '0', take: '2' });
    server.use(
      http.get(`${BASE_URL}/activity/photo-owner-normal/media`, () =>
        HttpResponse.json({
          media: [
            { url: TEST_URLS.routePhoto, thumbnail: null, blurhash: 'blurhash' },
            { url: 'webm', thumbnail: null, blurhash: null },
          ],
          hasMore: false,
          nextCursor: null,
        }),
      ),
    );

    await renderWithProviders(<PhotoViewer />);

    expect((await screen.findByTestId('photo-viewer-pager')).props.initialPage).toBe(0);
    expect(screen.getAllByTestId('photo-viewer-image').map((element) => element.props.children)).toContain(
      TEST_URLS.routePhoto,
    );
    expect(screen.getAllByTestId('photo-viewer-video').map((element) => element.props.children)).toContain(
      VIDEO_EXTENSIONS[13],
    );
  });

  it('does not render a pager when a valid activity has no media', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    const activityId = '550e8400-e29b-41d4-a716-446655440001';
    mockUseLocalSearchParams.mockReturnValue({
      photoUrl: activityId,
      indexOfPhoto: '0',
    });
    const requests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/activity/activityId/${activityId}`, () => {
        requests.push('activity');
        return HttpResponse.json({ ...MOCK_SERVER_ACTIVITY, media: [] });
      }),
    );

    await renderWithProviders(<PhotoViewer />);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(screen.queryByTestId('photo-viewer-pager')).not.toBeOnTheScreen();
  });

  it('shows activity media stage icons to viewers', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    const activityId = '550e8400-e29b-41d4-a716-446655440002';
    mockUseLocalSearchParams.mockReturnValue({
      photoUrl: activityId,
      indexOfPhoto: '0',
    });
    server.use(
      http.get(`${BASE_URL}/activity/activityId/${activityId}`, () =>
        HttpResponse.json({
          ...MOCK_SERVER_ACTIVITY,
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId: 'photo-owner',
          media: [
            { url: TEST_URLS.reviewPhoto, thumbnail: null, blurhash: null, mediaReviewStatus: 'review_required' },
          ],
        }),
      ),
    );

    await act(async () => mockStore.dispatch(setMockUserId('viewer-id')));
    await renderWithProviders(<PhotoViewer />);
    expect(await screen.findByTestId('media-moderation-placeholder')).toBeOnTheScreen();
  });

  it('hides activity media stage icons from the owner in the photo viewer', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    const activityId = '550e8400-e29b-41d4-a716-446655440003';
    mockUseLocalSearchParams.mockReturnValue({
      photoUrl: activityId,
      indexOfPhoto: '0',
    });
    server.use(
      http.get(`${BASE_URL}/activity/activityId/${activityId}`, () =>
        HttpResponse.json({
          ...MOCK_SERVER_ACTIVITY,
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId: 'photo-owner',
          media: [
            { url: TEST_URLS.reviewPhoto, thumbnail: null, blurhash: null, mediaReviewStatus: 'review_required' },
          ],
        }),
      ),
    );
    await act(async () => mockStore.dispatch(setMockUserId('photo-owner')));
    await renderWithProviders(<PhotoViewer />);
    await screen.findByTestId('photo-viewer-image');
    expect(screen.queryByTestId('media-moderation-placeholder')).not.toBeOnTheScreen();
  });
});
