import { screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { BASE_URL } from '@T/utils/handlers';
import { loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { GROUPS_COPY } from '../../const';
import GroupEventsList from './group-events-list';

describe('GroupEventsList', () => {
  it('shows event details returned for the selected period', async () => {
    server.use(
      http.get(`${BASE_URL}/groups/group-1/events`, () =>
        HttpResponse.json([
          {
            id: 'event-1',
            title: 'Sunday long run',
            startsAt: '2026-11-01T10:00:00.000Z',
            description: 'Meet at the park',
            locationName: 'Gorky Park',
          },
        ]),
      ),
    );
    await renderWithProviders(
      <GroupEventsList
        groupId="group-1"
        period="upcoming"
        canSeeEvents
        copy={GROUPS_COPY[LANGUAGES.english]}
        locale="en-US"
      />,
    );

    expect(await screen.findByText('Sunday long run')).toBeOnTheScreen();
    expect(screen.getByText('Meet at the park')).toBeOnTheScreen();
    expect(screen.getByText('Gorky Park')).toBeOnTheScreen();
  });

  it('shows loading and hides private events without requesting them', async () => {
    const requests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/groups/group-1/events`, loadingResponse),
      http.get(`${BASE_URL}/groups/private-group/events`, ({ request }) => {
        requests.push(request.url);
        return HttpResponse.json([]);
      }),
    );
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
    expect(requests).toEqual([]);
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
    const requests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/groups/group-1/events`, ({ request }) => {
        requests.push(request.url);
        return HttpResponse.json([]);
      }),
    );
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
    expect(requests).toEqual([]);
  });
});
