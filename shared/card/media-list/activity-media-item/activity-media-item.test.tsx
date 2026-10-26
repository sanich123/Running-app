import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MEDIA_MODERATION_PLACEHOLDER_COPY } from '@S/media-moderation-placeholder/const';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityMediaItem from './activity-media-item';
import { ACTIVITY_MEDIA_COPY } from './const';
import { ActivityCardContext } from '../../context';
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

const defaultActivity: ActivityCardData = {
  date: '2026-08-09T10:00:00.000Z',
  sport: 'run',
  id: 'activity-id',
  userId: 'activity-owner',
  duration: 0,
  distance: 0,
  elevationGain: 0,
  profile: {},
  commentsLength: 0,
};

async function renderActivityMediaItem({
  item,
  activity,
  selectedMediaId = null,
  onToggleDelete = jest.fn(),
  onDeleteSuccess = jest.fn(),
}: {
  item: DisplayedMediaItem;
  activity?: Partial<ActivityCardData>;
  selectedMediaId?: string | null;
  onToggleDelete?: (mediaId: string) => void;
  onDeleteSuccess?: () => void;
}) {
  return await renderWithProviders(
    <ActivityCardContext.Provider
      value={{
        activity: { ...defaultActivity, ...activity },
        isFullView: false,
        isShowDescription: false,
      }}>
      <ActivityMediaItem
        item={item}
        index={0}
        selectedMediaId={selectedMediaId}
        onToggleDelete={onToggleDelete}
        onDeleteSuccess={onDeleteSuccess}
      />
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
    const photoUrl = 'https://images.example.test/activity-photo.jpg';
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderActivityMediaItem({
      item: { id: 'photo-id', url: photoUrl, thumbnail: null, blurhash: 'photo-blurhash' },
    });

    const initialWidth = screen.getByTestId(photoUrl).props.style.width;
    await fireEvent(screen.getByTestId(photoUrl), 'load', { source: { width: 480, height: 240 } });
    expect(screen.getByTestId(photoUrl).props.style.width).not.toBe(initialWidth);

    const mediaButton = screen.getByTestId('activity-media-photo-id');
    expect(mediaButton).toHaveProp('accessibilityLabel', ACTIVITY_MEDIA_COPY[LANGUAGES.english].openMedia);
    await userEvent.press(mediaButton);
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.media}/activity-id?indexOfPhoto=0&blurhash=photo-blurhash`);
  });

  it('reports a long-pressed owner photo selection to the list', async () => {
    const onToggleDelete = jest.fn();
    await renderActivityMediaItem({
      item: { id: 'photo-id', url: 'https://images.example.test/photo.jpg', thumbnail: null },
      onToggleDelete,
    });

    await fireEvent(screen.getByTestId('activity-media-photo-id'), 'longPress');

    expect(onToggleDelete).toHaveBeenCalledWith('photo-id');
  });
});
