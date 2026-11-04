import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupInfoCard from './group-info-card';
import { GROUP_CATEGORY_LABELS, GROUPS_COPY } from '../../const';
import { GROUP_FIXTURE } from '../../test-fixtures';
import type { GroupDetails } from '@R/services/groups/types';

const mockJoinGroup = jest.fn();
const mockLeaveGroup = jest.fn();
const mockJoinMutation = jest.fn();
const mockBack = jest.fn();

jest.mock('@R/services/groups/groups', () => ({
  useJoinGroupMutation: (...args: unknown[]) => mockJoinMutation(...args),
  useLeaveGroupMutation: () => [mockLeaveGroup, { isLoading: false }],
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

const group: GroupDetails = { ...GROUP_FIXTURE, updatedAt: GROUP_FIXTURE.createdAt };

describe('GroupInfoCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockJoinGroup.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: GROUP_FIXTURE.id }) });
    mockLeaveGroup.mockReturnValue({ unwrap: jest.fn().mockResolvedValue(undefined) });
    mockJoinMutation.mockReturnValue([mockJoinGroup, { isLoading: false, reset: jest.fn() }]);
  });

  it('shows group information and joins from its own mutation', async () => {
    await renderWithProviders(<GroupInfoCard group={group} />);

    expect(screen.getByText(GROUP_FIXTURE.name)).toBeOnTheScreen();
    expect(screen.getByText(GROUP_FIXTURE.description!)).toBeOnTheScreen();
    GROUP_FIXTURE.categoryTags.forEach((categoryTag) => {
      expect(screen.getByText(GROUP_CATEGORY_LABELS.en[categoryTag])).toBeOnTheScreen();
    });
    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].join));
    await waitFor(() => expect(mockJoinGroup).toHaveBeenCalledWith(GROUP_FIXTURE.id));
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

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].leave)).toBeOnTheScreen();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].join)).not.toBeOnTheScreen();
  });

  it('uses the matching active join result while membership refreshes', async () => {
    mockJoinMutation.mockReturnValue([
      mockJoinGroup,
      {
        data: {
          id: GROUP_FIXTURE.id,
          currentMembership: {
            status: 'active',
            role: 'member',
            notificationPreference: 'all',
            feedPreference: 'all',
          },
        },
        isLoading: false,
      },
    ]);
    await renderWithProviders(<GroupInfoCard group={{ ...group, currentMembership: null }} isRefreshing />);

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
