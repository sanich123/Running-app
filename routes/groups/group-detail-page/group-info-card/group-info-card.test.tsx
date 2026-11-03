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
    await waitFor(() => expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].leave)).toBeOnTheScreen());
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
