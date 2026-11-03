import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupCard from './group-card';
import { GROUPS_COPY, GROUP_CATEGORY_LABELS, getGroupSportLabels } from '../../const';
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
        `${GROUPS_COPY[LANGUAGES.english].closed} · ${getGroupSportLabels(LANGUAGES.english)[group.sports[0]]} · ${group.memberCount} ${GROUPS_COPY[LANGUAGES.english].members}`,
      ),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].pending)).toBeOnTheScreen();
    expect(screen.getByTestId(`group-photo-${group.id}`)).toBeOnTheScreen();
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
