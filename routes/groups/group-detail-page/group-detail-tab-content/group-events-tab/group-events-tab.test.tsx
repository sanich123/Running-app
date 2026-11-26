import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { StyleSheet } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { GROUPS_COPY } from '../../../const';
import { GROUP_FIXTURE } from '../../../test-fixtures';
import GroupEventsTab from './group-events-tab';
import type { GroupDetails } from '@R/services/groups/types';

const group: GroupDetails = { ...GROUP_FIXTURE, updatedAt: GROUP_FIXTURE.createdAt };

describe('GroupEventsTab', () => {
  const copy = GROUPS_COPY[LANGUAGES.english];
  const eventRequests: URL[] = [];
  let eventsResponse: unknown[] = [];
  let failFirstEventsRequest = false;

  beforeEach(() => {
    jest.clearAllMocks();
    eventRequests.length = 0;
    eventsResponse = [
      {
        id: 'event-1',
        title: 'Sunday long run',
        startsAt: '2026-11-08T10:00:00.000Z',
        description: 'Easy pace',
        locationName: 'Gorky Park',
        sport: 'run',
        distanceKm: 8,
        createdAt: '2026-11-01T10:00:00.000Z',
      },
    ];
    failFirstEventsRequest = false;
    server.use(
      http.get(`${BASE_URL}/groups/group-1/events`, ({ request }) => {
        eventRequests.push(new URL(request.url));
        if (failFirstEventsRequest) {
          failFirstEventsRequest = false;
          return HttpResponse.json({ message: 'Service unavailable' }, { status: 503 });
        }
        return HttpResponse.json({ items: eventsResponse, hasMore: false, nextCursor: null });
      }),
    );
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  it('shows events and forwards a period selection', async () => {
    await renderWithProviders(<GroupEventsTab group={group} />);

    expect(await screen.findByText('Sunday long run')).toBeOnTheScreen();
    expect(screen.getByText('Gorky Park')).toBeOnTheScreen();
    expect(screen.getByText('Running · 8 km')).toBeOnTheScreen();

    await userEvent.press(screen.getByText(copy.pastEvents));

    await waitFor(() => expect(eventRequests.at(-1)?.searchParams.get('period')).toBe('past'));
    expect(eventRequests[0]?.searchParams.get('period')).toBe('upcoming');
  });

  it('shows a retry action when event loading fails', async () => {
    failFirstEventsRequest = true;
    await renderWithProviders(<GroupEventsTab group={group} />);

    expect(await screen.findByText('503, Service unavailable')).toBeOnTheScreen();
    await userEvent.press(screen.getByText(copy.retry));
    await waitFor(() => expect(eventRequests).toHaveLength(2));
  });

  it('centers the empty event state in a full-height tab', async () => {
    eventsResponse = [];
    await renderWithProviders(<GroupEventsTab group={group} />);

    expect(await screen.findByText(copy.noUpcomingEvents)).toBeOnTheScreen();
    expect(StyleSheet.flatten(screen.getByTestId('group-detail-scroll').props.contentContainerStyle)).toEqual(
      expect.objectContaining({ flexGrow: 1 }),
    );
  });
});
