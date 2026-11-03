import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupPostsList from './group-posts-list';
import { GROUPS_COPY } from '../../../const';
import { GROUP_FIXTURE } from '../../../test-fixtures';
import type { GroupDetails, GroupPost } from '@R/services/groups/types';

const mockUseGroupPostsList = jest.fn();
const mockPush = jest.fn();

jest.mock('./use-group-posts-list', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseGroupPostsList(...args),
}));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

const group: GroupDetails = { ...GROUP_FIXTURE, updatedAt: GROUP_FIXTURE.createdAt };
const post: GroupPost = {
  id: 'post-1',
  text: 'Long run on Sunday',
  createdAt: '2026-10-29T10:00:00.000Z',
  author: { userId: 'member-1', name: 'Alex Runner', profilePhoto: null },
  photoUrl: null,
};

describe('GroupPostsList', () => {
  const refetch = jest.fn();
  const copy = GROUPS_COPY[LANGUAGES.english];
  const makeResult = () => ({
    canSeePosts: true,
    copy,
    error: undefined,
    isError: false,
    isFetchingNextPage: false,
    isLoading: false,
    onScroll: jest.fn(),
    posts: [post],
    refetch,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockUseGroupPostsList.mockReturnValue(makeResult());
  });

  it('shows group posts and opens the author profile', async () => {
    await renderWithProviders(<GroupPostsList group={group} />);

    expect(screen.getByText(post.text)).toBeOnTheScreen();
    await userEvent.press(screen.getByTestId(`group-post-author-${post.id}`));
    expect(mockPush).toHaveBeenCalledWith('/profile/member-1');
  });

  it('shows an empty feed message', async () => {
    mockUseGroupPostsList.mockReturnValue({
      ...makeResult(),
      posts: [],
    });
    await renderWithProviders(<GroupPostsList group={group} />);

    expect(screen.getByText(copy.noPosts)).toBeOnTheScreen();
  });

  it('retries after the feed query fails', async () => {
    mockUseGroupPostsList.mockReturnValue({
      ...makeResult(),
      error: { status: 500, data: { message: 'Internal Server Error' } },
      isError: true,
    });
    await renderWithProviders(<GroupPostsList group={group} />);

    expect(screen.getByText('500, Internal Server Error')).toBeOnTheScreen();
    await userEvent.press(screen.getByText(copy.retry));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
