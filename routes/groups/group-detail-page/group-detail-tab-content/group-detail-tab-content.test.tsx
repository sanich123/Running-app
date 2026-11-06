import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_GROUP_PAGE } from '@T/responses/groups';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupDetailTabContent from './group-detail-tab-content';
import { GROUPS_COPY } from '../../const';
import { GROUP_FIXTURE } from '../../test-fixtures';
import type { GroupDetails } from '@R/services/groups/types';

const groupRequests: string[] = [];
let failFirstPostsRequest = false;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useLocalSearchParams: () => ({ tab: 'posts' }),
}));

const group: GroupDetails = {
  ...GROUP_FIXTURE,
  updatedAt: GROUP_FIXTURE.createdAt,
};

describe('GroupDetailTabContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    groupRequests.length = 0;
    failFirstPostsRequest = false;
    server.use(
      http.get(`${BASE_URL}/groups/group-1/members`, () => {
        groupRequests.push('members');
        return HttpResponse.json(MOCK_GROUP_PAGE);
      }),
      http.get(`${BASE_URL}/groups/group-1/statistics/month`, () => {
        groupRequests.push('statistics');
        return HttpResponse.json(MOCK_GROUP_PAGE);
      }),
      http.get(`${BASE_URL}/groups/group-1/posts`, () => {
        groupRequests.push('posts');
        if (failFirstPostsRequest) {
          failFirstPostsRequest = false;
          return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }
        return HttpResponse.json(MOCK_GROUP_PAGE);
      }),
      http.get(`${BASE_URL}/groups/group-1/events`, () => {
        groupRequests.push('events');
        return HttpResponse.json(MOCK_GROUP_PAGE);
      }),
    );
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  it('shows the post request HTTP status and retries the failed request', async () => {
    failFirstPostsRequest = true;
    await renderWithProviders(<GroupDetailTabContent group={group} isActiveMember />);
    const user = userEvent.setup();
    const copy = GROUPS_COPY[LANGUAGES.english];
    await user.press(screen.getByLabelText(copy.postsTab));

    expect(await screen.findByText('500, Internal Server Error')).toBeOnTheScreen();
    await user.press(screen.getByText(copy.retry));
    await waitFor(() => expect(groupRequests.filter((request) => request === 'posts')).toHaveLength(2));
  });

  it('hides group tabs and skips tab queries for a visitor', async () => {
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(<GroupDetailTabContent group={group} isActiveMember={false} />);

    expect(screen.getByText(copy.groupContentMembersOnly)).toBeOnTheScreen();
    expect(screen.queryByLabelText(copy.membersTab)).not.toBeOnTheScreen();
    expect(screen.queryByLabelText(copy.postsTab)).not.toBeOnTheScreen();
    expect(screen.getByTestId('group-detail-access-gate').props.style).toEqual(
      expect.objectContaining({ flex: 1, justifyContent: 'center' }),
    );
    expect(groupRequests).toEqual([]);
  });

  it('shows approval guidance without tabs while a join request is pending', async () => {
    const copy = GROUPS_COPY[LANGUAGES.english];
    const pendingGroup: GroupDetails = {
      ...group,
      privacy: 'closed',
      currentMembership: {
        status: 'pending',
        role: 'member',
        notificationPreference: 'all',
        feedPreference: 'all',
      },
    };
    await renderWithProviders(<GroupDetailTabContent group={pendingGroup} isActiveMember={false} />);

    expect(screen.getByText(copy.groupContentApprovalPending)).toBeOnTheScreen();
    expect(screen.queryByLabelText(copy.events)).not.toBeOnTheScreen();
  });
});
