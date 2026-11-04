import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupCard from './group-card';
import { GROUPS_COPY, GROUP_CATEGORY_LABELS, getGroupMemberCountLabel, getGroupSportLabels } from '../../const';
import { GROUP_FIXTURE } from '../../test-fixtures';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('GroupCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  it('shows group details and opens the selected group', async () => {
    await renderWithProviders(<GroupCard group={GROUP_FIXTURE} />);

    expect(screen.getByText(GROUP_FIXTURE.name)).toBeOnTheScreen();
    expect(
      screen.getByText(
        GROUP_FIXTURE.categoryTags.map((categoryTag) => GROUP_CATEGORY_LABELS.en[categoryTag]).join(' · '),
      ),
    ).toBeOnTheScreen();
    expect(screen.getByText(GROUP_FIXTURE.locationName!)).toBeOnTheScreen();
    fireEvent.press(screen.getByText(GROUP_FIXTURE.name));
    expect(mockPush).toHaveBeenCalledWith(`/groups/${GROUP_FIXTURE.id}`);
  });

  it('shows a pending membership indicator for closed groups', async () => {
    const group = {
      ...GROUP_FIXTURE,
      privacy: 'closed' as const,
      currentMembership: {
        status: 'pending' as const,
        role: 'member' as const,
        notificationPreference: 'all' as const,
        feedPreference: 'all' as const,
      },
    };
    await renderWithProviders(<GroupCard group={group} />);

    expect(
      screen.getByLabelText(
        `${GROUPS_COPY[LANGUAGES.english].closed} · ${getGroupSportLabels(LANGUAGES.english)[group.sports[0]]} · ${getGroupMemberCountLabel(LANGUAGES.english, group.memberCount)}`,
      ),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].pending)).toBeOnTheScreen();
    expect(screen.getByTestId(`group-photo-${group.id}`)).toBeOnTheScreen();
  });

  it.each([
    { memberCount: 1, label: '1 участник' },
    { memberCount: 2, label: '2 участника' },
    { memberCount: 4, label: '4 участника' },
    { memberCount: 5, label: '5 участников' },
    { memberCount: 11, label: '11 участников' },
    { memberCount: 21, label: '21 участник' },
    { memberCount: 22, label: '22 участника' },
    { memberCount: 25, label: '25 участников' },
  ])('uses the correct Russian member count form for $memberCount', async ({ memberCount, label }) => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<GroupCard group={{ ...GROUP_FIXTURE, memberCount }} />);

    expect(screen.getByText(label)).toBeOnTheScreen();
  });

  it('shows a pending group cover to non-owners as a blurhash with a moderation button', async () => {
    const group = {
      ...GROUP_FIXTURE,
      photoPreviewUrl: 'https://cdn.example.test/private-preview.jpg',
      photoBlurhash: 'pending-blurhash',
      photoReviewStatus: 'review_required' as const,
      photoPending: true,
      isOwner: false,
    };
    await renderWithProviders(<GroupCard group={group} />);

    expect(screen.queryByTestId(`group-photo-${group.id}-image`)).toBeNull();
    expect(screen.getByTestId(`group-photo-${group.id}-placeholder-blurhash`)).toHaveProp(
      'placeholder',
      'blurhash:/pending-blurhash',
    );
    expect(screen.getByRole('button', { name: 'Photo is under moderation' })).toBeOnTheScreen();
  });

  it('does not show a pending approval indicator for an open group', async () => {
    const group = {
      ...GROUP_FIXTURE,
      currentMembership: {
        status: 'pending' as const,
        role: 'member' as const,
        notificationPreference: 'all' as const,
        feedPreference: 'all' as const,
      },
    };
    await renderWithProviders(<GroupCard group={group} />);

    expect(screen.queryByLabelText(GROUPS_COPY[LANGUAGES.english].pending)).toBeNull();
  });
});
