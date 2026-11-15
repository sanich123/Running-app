import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { GROUPS_COPY } from '../../../const';
import GroupPostCard from './group-post-card';
import type { GroupPost } from '@R/services/groups/types';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('GroupPostCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setMockUserId(''));
  });

  it('shows the post and opens the author profile', async () => {
    const post: GroupPost = {
      id: 'post-1',
      text: 'Long run on Sunday',
      createdAt: '2026-10-29T10:00:00.000Z',
      author: { userId: 'member-1', name: 'Alex Runner', profilePhoto: null },
      photoUrl: null,
    };
    await renderWithProviders(<GroupPostCard post={post} />);

    expect(screen.getByText('Long run on Sunday')).toBeOnTheScreen();
    expect(screen.getByText('Alex Runner')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('group-post-author-post-1'));

    expect(mockPush).toHaveBeenCalledWith('/profile/member-1');
  });

  it('uses the member label and explains when an attached photo is unavailable', async () => {
    const post: GroupPost = {
      id: 'post-without-photo',
      text: 'Route notes',
      createdAt: '2026-10-29T10:00:00.000Z',
      author: null,
      photoUrl: null,
      hasPhoto: true,
      photoPending: false,
    };
    await renderWithProviders(<GroupPostCard post={post} />);

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].member)).toBeOnTheScreen();
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].postPhotoUnavailable)).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('group-post-author-post-without-photo'));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows a pending post photo to other members as a blurhash with a moderation button', async () => {
    const post: GroupPost = {
      id: 'pending-post',
      text: 'Route under review',
      createdAt: '2026-10-29T10:00:00.000Z',
      author: { userId: 'author-1', name: 'Alex Runner', profilePhoto: null },
      photoUrl: null,
      photoBlurhash: 'pending-blurhash',
      photoReviewStatus: 'review_required',
      hasPhoto: true,
      photoPending: true,
    };
    await renderWithProviders(<GroupPostCard post={post} />);

    expect(screen.queryByTestId('group-post-photo-pending-post-image')).toBeNull();
    expect(screen.getByTestId('group-post-photo-pending-post-placeholder-blurhash')).toHaveProp(
      'placeholder',
      'blurhash:/pending-blurhash',
    );
    expect(screen.getByRole('button', { name: 'Photo is under moderation' })).toBeOnTheScreen();
  });

  it('shows the pending photo preview to its post author without a moderation button', async () => {
    mockStore.dispatch(setMockUserId('author-1'));
    const post: GroupPost = {
      id: 'owner-pending-post',
      text: 'My route under review',
      createdAt: '2026-10-29T10:00:00.000Z',
      author: { userId: 'author-1', name: 'Alex Runner', profilePhoto: null },
      photoUrl: null,
      photoPreviewUrl: 'https://cdn.example.test/private-preview.jpg',
      photoBlurhash: 'pending-blurhash',
      photoReviewStatus: 'processing',
      hasPhoto: true,
      photoPending: true,
    };
    await renderWithProviders(<GroupPostCard post={post} />);

    expect(screen.getByTestId('group-post-photo-owner-pending-post-image')).toHaveProp('source', {
      uri: 'https://cdn.example.test/private-preview.jpg',
    });
    expect(screen.queryByTestId('group-post-photo-owner-pending-post-moderation-status')).toBeNull();
  });

  it('hides pending post text from other members and provides a manual status refresh', async () => {
    const onRefreshStatus = jest.fn();
    const post: GroupPost = {
      id: 'pending-text-post',
      text: 'This text must stay private',
      moderationStatus: 'pending',
      createdAt: '2026-10-29T10:00:00.000Z',
      author: { userId: 'post-author', name: 'Alex Runner', profilePhoto: null },
      photoUrl: null,
    };
    await renderWithProviders(<GroupPostCard post={post} onRefreshStatus={onRefreshStatus} />);

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].postTextPending)).toBeOnTheScreen();
    expect(screen.queryByText('This text must stay private')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: GROUPS_COPY[LANGUAGES.english].refreshModerationStatus }));
    expect(onRefreshStatus).toHaveBeenCalledTimes(1);
  });

  it('keeps pending group post text visible to its author', async () => {
    mockStore.dispatch(setMockUserId('post-author'));
    const post: GroupPost = {
      id: 'owner-pending-text-post',
      text: 'My pending post',
      moderationStatus: 'pending',
      createdAt: '2026-10-29T10:00:00.000Z',
      author: { userId: 'post-author', name: 'Alex Runner', profilePhoto: null },
      photoUrl: null,
    };
    await renderWithProviders(<GroupPostCard post={post} />);

    expect(screen.getByText('My pending post')).toBeOnTheScreen();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].refreshModerationStatus)).toBeNull();
  });
});
