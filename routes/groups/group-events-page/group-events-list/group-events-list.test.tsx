import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupEventsList from './group-events-list';
import { GROUPS_COPY } from '../../const';

const mockGetEvents = jest.fn();

jest.mock('@R/services/groups/groups', () => ({
  useGetGroupEventsQuery: (...args: unknown[]) => mockGetEvents(...args),
}));

describe('GroupEventsList', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows event details returned for the selected period', async () => {
    mockGetEvents.mockReturnValue({
      data: [
        {
          id: 'event-1',
          title: 'Sunday long run',
          startsAt: '2026-11-01T10:00:00.000Z',
          description: 'Meet at the park',
          locationName: 'Gorky Park',
        },
      ],
      isLoading: false,
    });
    await renderWithProviders(
      <GroupEventsList
        groupId="group-1"
        period="upcoming"
        canSeeEvents
        copy={GROUPS_COPY[LANGUAGES.english]}
        locale="en-US"
      />,
    );

    expect(screen.getByText('Sunday long run')).toBeOnTheScreen();
    expect(screen.getByText('Meet at the park')).toBeOnTheScreen();
    expect(screen.getByText('Gorky Park')).toBeOnTheScreen();
  });

  it('shows loading and hides private events without requesting them', async () => {
    mockGetEvents.mockReturnValue({ data: [], isLoading: true });
    await renderWithProviders(
      <GroupEventsList
        groupId="group-1"
        period="upcoming"
        canSeeEvents
        copy={GROUPS_COPY[LANGUAGES.english]}
        locale="en-US"
      />,
    );
    expect(screen.getByRole('progressbar')).toBeOnTheScreen();

    mockGetEvents.mockClear();
    mockGetEvents.mockReturnValue({ data: [], isLoading: false });
    await renderWithProviders(
      <GroupEventsList
        groupId="private-group"
        period="upcoming"
        canSeeEvents={false}
        copy={GROUPS_COPY[LANGUAGES.english]}
        locale="en-US"
      />,
    );
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].eventsPrivate)).toBeOnTheScreen();
    expect(mockGetEvents).toHaveBeenCalledWith({ groupId: 'private-group', period: 'upcoming' }, { skip: true });
  });

  it.each([
    ['upcoming', 'noUpcomingEvents'],
    ['past', 'noPastEvents'],
  ] as const)('shows the empty state for the %s period', async (period, emptyCopyKey) => {
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(
      <GroupEventsList groupId="group-1" period={period} canSeeEvents copy={copy} locale="en-US" events={[]} />,
    );

    expect(screen.getByText(copy[emptyCopyKey])).toBeOnTheScreen();
  });

  it('renders provided event sport, distance and optional details without querying', async () => {
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(
      <GroupEventsList
        groupId="group-1"
        period="upcoming"
        canSeeEvents
        copy={copy}
        locale="en-US"
        events={[
          {
            id: 'event-2',
            title: 'Park loop',
            startsAt: '2026-11-05T10:00:00.000Z',
            sport: 'run',
            distanceKm: 5.5,
            locationName: 'Gorky Park',
            description: 'Easy pace',
            createdAt: '2026-11-01T10:00:00.000Z',
          },
        ]}
      />,
    );

    expect(screen.getByText('Running · 5.5 km')).toBeOnTheScreen();
    expect(screen.getByText('Easy pace')).toBeOnTheScreen();
    expect(mockGetEvents).toHaveBeenCalledWith({ groupId: 'group-1', period: 'upcoming' }, { skip: true });
  });
});
