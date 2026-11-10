import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { GROUPS_COPY } from '../const';
import GroupMemberRow from './group-member-row';
import type { GroupMember } from '@R/services/groups/types';

describe('GroupMemberRow', () => {
  it('shows member details and lets an admin approve a request', async () => {
    const onUpdateMember = jest.fn();
    const member: GroupMember = {
      userId: 'member-1',
      role: 'member',
      status: 'pending',
      joinedAt: null,
      profile: { name: 'Alex', surname: 'Runner', city: 'Moscow', profilePhoto: null },
    };
    await renderWithProviders(
      <GroupMemberRow
        member={member}
        copy={GROUPS_COPY[LANGUAGES.english]}
        language={LANGUAGES.english}
        canManage
        isRequest
        isUpdating={false}
        onUpdateMember={onUpdateMember}
      />,
    );

    expect(screen.getByText('Alex Runner')).toBeOnTheScreen();
    expect(screen.getByText('Moscow')).toBeOnTheScreen();
    const user = userEvent.setup();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].approve));
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].decline));

    expect(onUpdateMember).toHaveBeenCalledWith('member-1', 'active');
    expect(onUpdateMember).toHaveBeenCalledWith('member-1', 'rejected');
  });

  it('does not show management actions to a non-admin', async () => {
    const member: GroupMember = {
      userId: 'member-1',
      role: 'member',
      status: 'active',
      joinedAt: '2026-10-29T10:00:00.000Z',
      profile: null,
    };
    await renderWithProviders(
      <GroupMemberRow
        member={member}
        copy={GROUPS_COPY[LANGUAGES.english]}
        language={LANGUAGES.english}
        canManage={false}
        isUpdating={false}
        onUpdateMember={jest.fn()}
      />,
    );

    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].remove)).not.toBeOnTheScreen();
  });

  it('shows administrator details and a removal action', async () => {
    const onUpdateMember = jest.fn();
    const admin: GroupMember = {
      userId: 'admin-1',
      role: 'admin',
      status: 'active',
      joinedAt: '2026-10-29T10:00:00.000Z',
      profile: { name: 'Sam', surname: null, city: null, profilePhoto: null },
    };
    await renderWithProviders(
      <GroupMemberRow
        member={admin}
        copy={GROUPS_COPY[LANGUAGES.english]}
        language={LANGUAGES.english}
        canManage
        isUpdating={false}
        onUpdateMember={onUpdateMember}
      />,
    );

    expect(screen.getByText('Sam')).toBeOnTheScreen();
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].admin)).toBeOnTheScreen();
    const user = userEvent.setup();
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].remove));
    expect(onUpdateMember).toHaveBeenCalledWith('admin-1', 'removed');
  });

  it('shows the owner role and protects the owner from removal', async () => {
    const member: GroupMember = {
      userId: 'owner-1',
      role: 'owner',
      status: 'active',
      joinedAt: null,
      profile: null,
    };
    await renderWithProviders(
      <GroupMemberRow
        member={member}
        copy={GROUPS_COPY[LANGUAGES.english]}
        language={LANGUAGES.english}
        canManage
        isUpdating={false}
        onUpdateMember={jest.fn()}
      />,
    );

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].owner)).toBeOnTheScreen();
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].member)).toBeOnTheScreen();
    expect(screen.queryByText(GROUPS_COPY[LANGUAGES.english].remove)).not.toBeOnTheScreen();
  });

  it('renders a member profile photo', async () => {
    const member: GroupMember = {
      userId: 'member-photo',
      role: 'member',
      status: 'active',
      joinedAt: null,
      profile: { name: 'Jordan', surname: 'Hill', city: 'Moscow', profilePhoto: 'https://example.com/jordan.jpg' },
    };
    await renderWithProviders(
      <GroupMemberRow
        member={member}
        copy={GROUPS_COPY[LANGUAGES.english]}
        language={LANGUAGES.english}
        canManage={false}
        isUpdating={false}
        onUpdateMember={jest.fn()}
      />,
    );

    expect(screen.getByText('Jordan Hill')).toBeOnTheScreen();
    expect(screen.getByText('Moscow')).toBeOnTheScreen();
  });

  it('shows the leaderboard rank and monthly distance', async () => {
    const member: GroupMember = {
      userId: 'runner-1',
      role: 'member',
      status: 'active',
      joinedAt: null,
      profile: { name: 'Jordan', surname: 'Hill', city: null, profilePhoto: null },
    };
    await renderWithProviders(
      <GroupMemberRow
        member={member}
        copy={GROUPS_COPY[LANGUAGES.english]}
        language={LANGUAGES.english}
        canManage={false}
        isUpdating={false}
        onUpdateMember={jest.fn()}
        rank={2}
        distanceLabel="45 km"
      />,
    );

    expect(screen.getByText('2')).toBeOnTheScreen();
    expect(screen.getByText('45 km')).toBeOnTheScreen();
  });

  it('opens the member profile when the profile area is pressed', async () => {
    const member: GroupMember = {
      userId: 'runner-1',
      role: 'member',
      status: 'active',
      joinedAt: null,
      profile: { name: 'Jordan', surname: 'Hill', city: null, profilePhoto: null },
    };
    const onPressProfile = jest.fn();
    await renderWithProviders(
      <GroupMemberRow
        member={member}
        copy={GROUPS_COPY[LANGUAGES.english]}
        language={LANGUAGES.english}
        canManage={false}
        isUpdating={false}
        onUpdateMember={jest.fn()}
        onPressProfile={onPressProfile}
      />,
    );

    await userEvent.press(screen.getByTestId('group-member-profile-runner-1'));

    expect(onPressProfile).toHaveBeenCalledTimes(1);
  });

  it('uses the translated member label when the profile has no name', async () => {
    const member: GroupMember = {
      userId: 'unnamed-member',
      role: 'member',
      status: 'active',
      joinedAt: null,
      profile: null,
    };
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(
      <GroupMemberRow
        member={member}
        copy={copy}
        language={LANGUAGES.english}
        canManage={false}
        isUpdating={false}
        onUpdateMember={jest.fn()}
        onPressProfile={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: copy.member })).toBeOnTheScreen();
  });
});
