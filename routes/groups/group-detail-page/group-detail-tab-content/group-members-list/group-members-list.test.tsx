import { screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupMembersList from './group-members-list';
import { GROUPS_COPY } from '../../../const';
import { GROUP_FIXTURE } from '../../../test-fixtures';
import type { GroupDetails, GroupMember } from '@R/services/groups/types';

const mockUseGroupMembersList = jest.fn();

jest.mock('./use-group-members-list', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseGroupMembersList(...args),
}));

const group: GroupDetails = {
  ...GROUP_FIXTURE,
  updatedAt: GROUP_FIXTURE.createdAt,
  currentMembership: { status: 'active', role: 'member', notificationPreference: 'all', feedPreference: 'all' },
};

describe('GroupMembersList', () => {
  const changeMember = jest.fn();
  const openProfile = jest.fn();
  const refetch = jest.fn();
  const copy = GROUPS_COPY[LANGUAGES.english];
  const member: GroupMember = {
    userId: 'member-1',
    role: 'member',
    status: 'active',
    joinedAt: '2026-10-29T10:00:00.000Z',
    profile: { name: 'Alex', surname: 'Runner', city: 'Moscow', profilePhoto: null },
  };
  const makeResult = () => ({
    canManageGroup: true,
    canSeeMembers: true,
    changeMember,
    copy,
    error: undefined,
    isError: false,
    isLoading: false,
    isUpdatingMember: false,
    language: LANGUAGES.english,
    members: [member],
    onScroll: jest.fn(),
    openProfile,
    refetch,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockUseGroupMembersList.mockReturnValue(makeResult());
  });

  it('shows members and forwards member actions without group preference controls', async () => {
    await renderWithProviders(<GroupMembersList group={group} />);

    expect(screen.getByText('Alex Runner')).toBeOnTheScreen();
    expect(screen.queryByText('Group notifications')).not.toBeOnTheScreen();
    expect(screen.queryByText('Show group posts in your home feed')).not.toBeOnTheScreen();
    const user = userEvent.setup();
    await user.press(screen.getByTestId('group-member-profile-member-1'));
    await user.press(screen.getByText(copy.remove));

    expect(openProfile).toHaveBeenCalledWith('member-1');
    expect(changeMember).toHaveBeenCalledWith('member-1', 'removed');
  });

  it('shows the empty state when there are no active members', async () => {
    mockUseGroupMembersList.mockReturnValue({
      ...makeResult(),
      members: [],
    });
    await renderWithProviders(<GroupMembersList group={group} />);

    expect(screen.getByText(copy.noMembers)).toBeOnTheScreen();
    expect(screen.queryByText('Group notifications')).not.toBeOnTheScreen();
    expect(screen.queryByText('Show group posts in your home feed')).not.toBeOnTheScreen();
    expect(StyleSheet.flatten(screen.getByTestId('group-detail-scroll').props.contentContainerStyle)).toEqual(
      expect.objectContaining({ flexGrow: 1 }),
    );
    expect(StyleSheet.flatten(screen.getByText(copy.noMembers).props.style)).toEqual(
      expect.objectContaining({ flex: 1, alignSelf: 'center', textAlign: 'center', textAlignVertical: 'center' }),
    );
  });

  it('retries after member loading fails', async () => {
    mockUseGroupMembersList.mockReturnValue({
      ...makeResult(),
      error: { status: 503, data: { message: 'Service unavailable' } },
      isError: true,
    });
    await renderWithProviders(<GroupMembersList group={group} />);

    expect(screen.getByText('503, Service unavailable')).toBeOnTheScreen();
    await userEvent.press(screen.getByText(copy.retry));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
