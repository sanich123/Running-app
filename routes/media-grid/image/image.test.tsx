import { act, fireEvent, screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { setMockUserId, mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import MediaGridImage from './image';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'profile-id' }),
  useRouter: () => ({ push: mockPush }),
}));

describe('image', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  afterEach(async () => {
    await act(async () => mockStore.dispatch(setMockUserId('')));
  });

  it('opens the selected media with its index and current page size', async () => {
    const user = userEvent.setup();
    const url = 'https://images.example.test/grid.jpg';
    await renderWithProviders(
      <MediaGridImage url={url} thumbnail={null} blurhash="grid-blurhash" index={3} take={28} />,
    );
    await user.press(screen.getByTestId(url));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.media}/3?userId=profile-id&take=28&blurhash=grid-blurhash`);
  });

  it('shows the delete button after a long press only for the profile owner', async () => {
    const media = {
      id: 'media-1',
      activityId: 'activity-1',
      url: 'https://images.example.test/owned.jpg',
      thumbnail: null,
      index: 0,
      take: 28,
    };
    await act(async () => mockStore.dispatch(setMockUserId('profile-id')));
    await renderWithProviders(<MediaGridImage {...media} />);

    await fireEvent(screen.getByTestId(`media-grid-image-${media.id}`), 'longPress');

    expect(screen.getByTestId('activity-media-delete-button')).toBeOnTheScreen();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not offer deletion to a viewer who is not the profile owner', async () => {
    const media = {
      id: 'media-1',
      activityId: 'activity-1',
      url: 'https://images.example.test/others.jpg',
      thumbnail: null,
      index: 0,
      take: 28,
    };
    await act(async () => mockStore.dispatch(setMockUserId('viewer-id')));
    await renderWithProviders(<MediaGridImage {...media} />);

    await fireEvent(screen.getByTestId(`media-grid-image-${media.id}`), 'longPress');

    expect(screen.queryByTestId('activity-media-delete-button')).not.toBeOnTheScreen();
  });
});
