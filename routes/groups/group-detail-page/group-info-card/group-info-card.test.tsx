import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { GROUP_CATEGORY_LABELS, GROUPS_COPY } from '../../const';
import { GROUP_FIXTURE } from '../../test-fixtures';
import GroupInfoCard from './group-info-card';
import type { GroupDetails } from '@R/services/groups/types';

const mockBack = jest.fn();
const groupRequests: string[] = [];
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

const group: GroupDetails = { ...GROUP_FIXTURE, updatedAt: GROUP_FIXTURE.createdAt };

describe('GroupInfoCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    groupRequests.length = 0;
    server.use(
      http.post(`${BASE_URL}/groups/group-1/join`, ({ request }) => {
        groupRequests.push(`${request.method} /groups/group-1/join`);
        return HttpResponse.json({
          ...GROUP_FIXTURE,
          currentMembership: {
            status: 'active',
            role: 'member',
            notificationPreference: 'all',
            feedPreference: 'all',
          },
        });
      }),
      http.delete(`${BASE_URL}/groups/group-1/membership`, ({ request }) => {
        groupRequests.push(`${request.method} /groups/group-1/membership`);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  it('shows group information and joins from its own mutation', async () => {
    await renderWithProviders(<GroupInfoCard group={group} />);

    expect(screen.getByText(GROUP_FIXTURE.name)).toBeOnTheScreen();
    expect(screen.getByText(GROUP_FIXTURE.description!)).toBeOnTheScreen();
    GROUP_FIXTURE.categoryTags.forEach((categoryTag) => {
      expect(screen.getByText(GROUP_CATEGORY_LABELS.en[categoryTag])).toBeOnTheScreen();
    });
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].join));
    await waitFor(() => expect(groupRequests).toEqual(['POST /groups/group-1/join']));
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].leave)).not.toBeOnTheScreen();
  });

  it('uses the correct Russian member count form in the group details', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<GroupInfoCard group={{ ...group, memberCount: 21 }} />);

    expect(screen.getByText('21 участник')).toBeOnTheScreen();
  });

  it('shows a pending group cover preview to its owner without a moderation button', async () => {
    await renderWithProviders(
      <GroupInfoCard
        group={{
          ...group,
          isOwner: true,
          photoPreviewUrl: 'https://cdn.example.test/private-preview.jpg',
          photoBlurhash: 'pending-blurhash',
          photoReviewStatus: 'processing',
          photoPending: true,
        }}
      />,
    );

    expect(screen.getByTestId('group-detail-photo-image')).toHaveProp('source', {
      uri: 'https://cdn.example.test/private-preview.jpg',
    });
    expect(screen.queryByTestId('group-detail-photo-moderation-status')).toBeNull();
  });

  it('shows leave only for an active non-owner membership', async () => {
    await renderWithProviders(
      <GroupInfoCard
        group={{
          ...group,
          currentMembership: {
            status: 'active',
            role: 'member',
            notificationPreference: 'all',
            feedPreference: 'all',
          },
        }}
      />,
    );

    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].leave));
    await waitFor(() => expect(groupRequests).toEqual(['DELETE /groups/group-1/membership']));
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].join)).not.toBeOnTheScreen();
  });

  it('uses the matching active join result while membership refreshes', async () => {
    await renderWithProviders(<GroupInfoCard group={{ ...group, currentMembership: null }} isRefreshing />);

    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].join));
    await waitFor(() => expect(groupRequests).toEqual(['POST /groups/group-1/join']));
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].leave)).toBeOnTheScreen();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].join)).not.toBeOnTheScreen();
  });

  it('shows the awaiting approval state and disables join for pending members', async () => {
    const closedGroup: GroupDetails = {
      ...group,
      privacy: 'closed',
      currentMembership: {
        status: 'pending',
        role: 'member',
        notificationPreference: 'all',
        feedPreference: 'all',
      },
    };
    await renderWithProviders(<GroupInfoCard group={closedGroup} />);

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].pending)).toBeDisabled();
  });
});
