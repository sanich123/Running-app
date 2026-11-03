import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupDetailTabContent from './group-detail-tab-content';
import { GROUPS_COPY } from '../../const';
import { GROUP_FIXTURE } from '../../test-fixtures';
import type { GroupDetails } from '@R/services/groups/types';

const mockGetMembers = jest.fn();
const mockGetMonthlyStatistics = jest.fn();
const mockGetPosts = jest.fn();
const mockGetEvents = jest.fn();
const mockUpdateMember = jest.fn();
const mockUpdatePreferences = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useLocalSearchParams: () => ({ tab: 'posts' }),
}));
jest.mock('@R/services/groups/groups', () => ({
  useGetGroupMembersInfiniteQuery: (...args: unknown[]) => mockGetMembers(...args),
  useGetGroupMonthlyStatisticsInfiniteQuery: (...args: unknown[]) => mockGetMonthlyStatistics(...args),
  useGetGroupPostsInfiniteQuery: (...args: unknown[]) => mockGetPosts(...args),
  useGetGroupEventsInfiniteQuery: (...args: unknown[]) => mockGetEvents(...args),
  useUpdateGroupMemberMutation: () => mockUpdateMember(),
  useUpdateGroupPreferencesMutation: () => mockUpdatePreferences(),
}));

const group: GroupDetails = {
  ...GROUP_FIXTURE,
  updatedAt: GROUP_FIXTURE.createdAt,
};

const emptyInfiniteQuery = {
  data: { pages: [{ items: [], hasMore: false, nextCursor: null }] },
  isLoading: false,
  isError: false,
  isFetchingNextPage: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn(),
};

describe('GroupDetailTabContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockGetMembers.mockReturnValue(emptyInfiniteQuery);
    mockGetMonthlyStatistics.mockReturnValue(emptyInfiniteQuery);
    mockGetEvents.mockReturnValue(emptyInfiniteQuery);
    mockGetPosts.mockReturnValue(emptyInfiniteQuery);
    mockUpdateMember.mockReturnValue([jest.fn(), { isLoading: false }]);
    mockUpdatePreferences.mockReturnValue([jest.fn(), { isLoading: false }]);
  });

  it('shows the post request HTTP status and retries the failed request', async () => {
    const refetch = jest.fn();
    mockGetPosts.mockReturnValue({
      ...emptyInfiniteQuery,
      data: undefined,
      isError: true,
      error: { status: 500, data: { message: 'Internal Server Error' } },
      refetch,
    });
    await renderWithProviders(<GroupDetailTabContent group={group} isActiveMember />);
    const user = userEvent.setup();
    const copy = GROUPS_COPY[LANGUAGES.english];
    await user.press(screen.getByLabelText(copy.postsTab));

    expect(screen.getByText('500, Internal Server Error')).toBeOnTheScreen();
    await user.press(screen.getByText(copy.retry));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
