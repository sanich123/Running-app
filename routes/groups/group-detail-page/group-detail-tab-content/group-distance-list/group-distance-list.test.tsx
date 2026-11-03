import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupDistanceList from './group-distance-list';
import { GROUPS_COPY } from '../../../const';
import { GROUP_FIXTURE } from '../../../test-fixtures';
import type { GroupDetails } from '@R/services/groups/types';

const mockUseGroupDistanceList = jest.fn();

jest.mock('./use-group-distance-list', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseGroupDistanceList(...args),
}));

const group: GroupDetails = { ...GROUP_FIXTURE, updatedAt: GROUP_FIXTURE.createdAt };

describe('GroupDistanceList', () => {
  const previousMonth = jest.fn();
  const nextMonth = jest.fn();
  const openProfile = jest.fn();
  const refetch = jest.fn();
  const copy = GROUPS_COPY[LANGUAGES.english];
  const makeResult = () => ({
    canGoToNextMonth: false,
    canSeeStatistics: true,
    changeMember: jest.fn(),
    copy,
    error: undefined,
    isError: false,
    isFetchingNextPage: false,
    isLoading: false,
    language: LANGUAGES.english,
    monthLabel: 'November 2026',
    onScroll: jest.fn(),
    openProfile,
    previousMonth,
    nextMonth,
    refetch,
    statistics: [
      {
        userId: 'runner-1',
        profile: { name: 'Jordan', surname: 'Hill', city: 'Moscow', profilePhoto: null },
        totalDistance: 12500,
      },
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockUseGroupDistanceList.mockReturnValue(makeResult());
  });

  it('shows the monthly leaderboard and opens a runner profile', async () => {
    await renderWithProviders(<GroupDistanceList group={group} />);

    expect(screen.getByText('November 2026')).toBeOnTheScreen();
    expect(screen.getByText('Jordan Hill')).toBeOnTheScreen();
    expect(screen.getByText('12.5 km')).toBeOnTheScreen();
    expect(screen.getByLabelText(copy.nextMonth)).toBeDisabled();

    const user = userEvent.setup();
    await user.press(screen.getByLabelText(copy.previousMonth));
    await user.press(screen.getByTestId('group-member-profile-runner-1'));

    expect(previousMonth).toHaveBeenCalledTimes(1);
    expect(openProfile).toHaveBeenCalledWith('runner-1');
  });

  it('shows the empty leaderboard message', async () => {
    mockUseGroupDistanceList.mockReturnValue({
      ...makeResult(),
      statistics: [],
    });
    await renderWithProviders(<GroupDistanceList group={group} />);

    expect(screen.getByText(copy.noMonthlyStats)).toBeOnTheScreen();
  });

  it('retries after the statistics query fails', async () => {
    mockUseGroupDistanceList.mockReturnValue({
      ...makeResult(),
      isError: true,
      error: { status: 503, data: { message: 'Service unavailable' } },
    });
    await renderWithProviders(<GroupDistanceList group={group} />);

    expect(screen.getByText('503, Service unavailable')).toBeOnTheScreen();
    await userEvent.press(screen.getByText(copy.retry));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
