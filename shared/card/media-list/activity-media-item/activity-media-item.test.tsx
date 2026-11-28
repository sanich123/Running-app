import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MEDIA_MODERATION_PLACEHOLDER_COPY } from '@S/media-moderation-placeholder/const';
import { DEFAULT_ACTIVITY_CARD, TEST_URLS } from '@T/mocks/const';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { ActivityCardContext } from '../../context';
import ActivityMediaItem from './activity-media-item';
import { ACTIVITY_MEDIA_COPY } from './const';
import type { ActivityCardData } from '../../types';
import type { DisplayedMediaItem } from '../types';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@S/custom-image/custom-image', () => ({
  __esModule: true,
  default: (props: { testID?: string; contentFit?: string }) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
}));

async function renderActivityMediaItem({
  item,
  activity,
}: {
  item: DisplayedMediaItem;
  activity?: Partial<ActivityCardData>;
}) {
  return await renderWithProviders(
    <ActivityCardContext.Provider
      value={{
        activity: { ...DEFAULT_ACTIVITY_CARD, ...activity },
        isFullView: false,
        isShowDescription: false,
      }}>
      <ActivityMediaItem item={item} index={0} />
    </ActivityCardContext.Provider>,
  );
}

describe('ActivityMediaItem', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockStore.dispatch(setMockUserId('activity-owner'));
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
  });

  it('shows an unblurred moderation preview to the activity owner', async () => {
    const previewUrl = 'https://cdn.example.test/pending-photo.jpg';
    await renderActivityMediaItem({
      item: {
        id: 'pending-photo',
        url: previewUrl,
        thumbnail: null,
        blurhash: 'photo-blurhash',
        mediaReviewStatus: 'processing',
      },
    });

    expect(screen.getByTestId(previewUrl)).toHaveProp('source', { uri: previewUrl });
    expect(screen.getByTestId(previewUrl).props.blurRadius).toBeUndefined();
    expect(screen.queryByTestId('media-moderation-placeholder')).not.toBeOnTheScreen();
  });

  it('blurs pending media for another viewer and announces its moderation state', async () => {
    const previewUrl = 'https://cdn.example.test/viewer-pending-photo.jpg';
    mockStore.dispatch(setMockUserId('viewer-id'));
    await renderActivityMediaItem({
      item: { id: 'pending-photo', url: previewUrl, thumbnail: null, mediaReviewStatus: 'queued' },
    });

    expect(screen.getByTestId(previewUrl)).toHaveProp('blurRadius', 20);
    expect(screen.getByTestId('media-moderation-placeholder')).toHaveProp(
      'accessibilityLabel',
      MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].queued,
    );
  });

  it('updates photo dimensions and opens it with the localized media label', async () => {
    const photoUrl = TEST_URLS.imageActivityPhoto;
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderActivityMediaItem({
      item: { id: 'photo-id', url: photoUrl, thumbnail: null, blurhash: 'photo-blurhash' },
    });

    const mediaContainer = screen.getByTestId('activity-media-container-photo-id');
    const initialWidth = StyleSheet.flatten(mediaContainer.props.style).width;
    await fireEvent(screen.getByTestId(photoUrl), 'load', { source: { width: 480, height: 240 } });
    expect(StyleSheet.flatten(screen.getByTestId('activity-media-container-photo-id').props.style).width).not.toBe(
      initialWidth,
    );

    const mediaButton = screen.getByTestId('activity-media-photo-id');
    expect(mediaButton).toHaveProp('accessibilityLabel', ACTIVITY_MEDIA_COPY[LANGUAGES.english].openMedia);
    await userEvent.press(mediaButton);
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.media}/activity-id?indexOfPhoto=0&blurhash=photo-blurhash`);
  });

  it('uses the aspect ratio received with the activity media', async () => {
    const photoUrl = 'https://images.example.test/server-ratio-photo.jpg';
    await renderActivityMediaItem({
      item: { id: 'server-ratio-photo', url: photoUrl, thumbnail: null, aspectRatio: 2 },
    });

    const mediaContainer = screen.getByTestId('activity-media-container-server-ratio-photo');
    const serverRatioWidth = StyleSheet.flatten(mediaContainer.props.style).width;
    await fireEvent(screen.getByTestId(photoUrl), 'load', { source: { width: 1, height: 2 } });

    expect(
      StyleSheet.flatten(screen.getByTestId('activity-media-container-server-ratio-photo').props.style).width,
    ).toBe(serverRatioWidth);
  });

  it('falls back to image dimensions when the saved aspect ratio is invalid', async () => {
    const photoUrl = 'https://images.example.test/invalid-server-ratio.jpg';
    await renderActivityMediaItem({
      item: { id: 'invalid-server-ratio', url: photoUrl, thumbnail: null, aspectRatio: 0 },
    });

    const mediaContainer = screen.getByTestId('activity-media-container-invalid-server-ratio');
    const initialWidth = StyleSheet.flatten(mediaContainer.props.style).width;
    await fireEvent(screen.getByTestId(photoUrl), 'load', { source: { width: 480, height: 240 } });

    expect(
      StyleSheet.flatten(screen.getByTestId('activity-media-container-invalid-server-ratio').props.style).width,
    ).not.toBe(initialWidth);
  });

  it('shows a moderation placeholder when media has no available URL', async () => {
    mockStore.dispatch(setMockUserId('viewer-id'));
    await renderActivityMediaItem({
      item: { id: 'pending-without-url', url: null, thumbnail: null, mediaReviewStatus: 'processing' },
    });

    expect(screen.getByTestId('pending-activity-media-pending-without-url')).toBeOnTheScreen();
    expect(screen.getByTestId('media-moderation-placeholder')).toBeOnTheScreen();
  });

  it('shows the delete action in the media menu for the owner', async () => {
    const user = userEvent.setup();
    await renderActivityMediaItem({
      item: { id: 'photo-id', url: 'https://images.example.test/photo.jpg', thumbnail: null },
    });

    await user.press(screen.getByTestId('media-actions-menu-photo-id'));

    expect(await screen.findByTestId('delete-media-photo-id')).toBeOnTheScreen();
    expect(screen.queryByTestId('report-media-photo-id')).not.toBeOnTheScreen();
  });
});
