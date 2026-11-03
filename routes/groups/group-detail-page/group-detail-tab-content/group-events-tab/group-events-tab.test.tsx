import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupEventsTab from './group-events-tab';
import { GROUPS_COPY } from '../../../const';
import { GROUP_FIXTURE } from '../../../test-fixtures';
import type { GroupDetails } from '@R/services/groups/types';

const mockUseGroupEventsTab = jest.fn();
const mockGetGroupEvents = jest.fn();

jest.mock('./use-group-events-tab', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseGroupEventsTab(...args),
}));
jest.mock('@R/services/groups/groups', () => ({
  useGetGroupEventsQuery: (...args: unknown[]) => mockGetGroupEvents(...args),
}));

const group: GroupDetails = { ...GROUP_FIXTURE, updatedAt: GROUP_FIXTURE.createdAt };

describe('GroupEventsTab', () => {
  const setPeriod = jest.fn();
  const refetch = jest.fn();
  const copy = GROUPS_COPY[LANGUAGES.english];
  const makeResult = () => ({
    canSeeEvents: true,
    copy,
    error: undefined,
    events: [
      {
        id: 'event-1',
        title: 'Sunday long run',
        startsAt: '2026-11-08T10:00:00.000Z',
        description: 'Easy pace',
        locationName: 'Gorky Park',
        sport: 'run' as const,
        distanceKm: 8,
        createdAt: '2026-11-01T10:00:00.000Z',
      },
    ],
    isError: false,
    isFetchingNextPage: false,
    isLoading: false,
    locale: 'en-US',
    onScroll: jest.fn(),
    period: 'upcoming' as const,
    refetch,
    setPeriod,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockGetGroupEvents.mockReturnValue({ data: [], isLoading: false });
    mockUseGroupEventsTab.mockReturnValue(makeResult());
  });

  it('shows events and forwards a period selection', async () => {
    await renderWithProviders(<GroupEventsTab group={group} />);

    expect(screen.getByText('Sunday long run')).toBeOnTheScreen();
    expect(screen.getByText('Gorky Park')).toBeOnTheScreen();
    expect(screen.getByText('Running · 8 km')).toBeOnTheScreen();

    await userEvent.press(screen.getByText(copy.pastEvents));

    expect(setPeriod).toHaveBeenCalledWith('past');
    expect(mockGetGroupEvents).toHaveBeenCalledWith({ groupId: group.id, period: 'upcoming' }, { skip: true });
  });

  it('shows a retry action when event loading fails', async () => {
    mockUseGroupEventsTab.mockReturnValue({
      ...makeResult(),
      error: { status: 503, data: { message: 'Service unavailable' } },
      isError: true,
    });
    await renderWithProviders(<GroupEventsTab group={group} />);

    expect(screen.getByText('503, Service unavailable')).toBeOnTheScreen();
    await userEvent.press(screen.getByText(copy.retry));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
