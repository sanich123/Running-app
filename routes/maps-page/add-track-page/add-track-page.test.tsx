import { act, screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { MAPS_PAGE_COPY } from '../const';
import AddTrackPage from './add-track-page';
import type useAddTrackPage from './use-add-track-page';
import type { ActivityRouteWorkoutListItemResponse } from '@R/runich-api/types';

const mockUseAddTrackPage = jest.fn<ReturnType<typeof useAddTrackPage>, []>();
jest.mock('expo-router', () => ({ Stack: { Screen: () => null } }));
jest.mock('./use-add-track-page', () => ({ __esModule: true, default: () => mockUseAddTrackPage() }));

const activity: ActivityRouteWorkoutListItemResponse = {
  id: 'workout-1',
  userId: 'user-1',
  date: '2026-10-31T00:00:00.000Z',
  timeZone: 'UTC',
  title: 'Morning run',
  sport: 'running',
  duration: 3_600_000,
  distance: 5200,
  elevationGain: 25,
  profile: {},
  _count: { comments: 0, likes: 0 },
  routePointCount: 42,
};

describe('add track page', () => {
  const addActivityTrack = jest.fn();
  const fetchNextPage = jest.fn();
  const refetch = jest.fn();

  function makeHookState(overrides: Partial<ReturnType<typeof useAddTrackPage>> = {}) {
    return {
      activities: [activity],
      addActivityTrack,
      availableFilters: { years: [2026], months: [10], days: [31] },
      copy: MAPS_PAGE_COPY[LANGUAGES.english],
      fetchNextPage,
      filters: { month: null, day: null, year: null },
      importRoute: jest.fn(),
      isError: false,
      isFetchingNextPage: false,
      isLoading: false,
      isSearchOpen: false,
      language: LANGUAGES.english,
      locale: 'en-US',
      refetch,
      searchQuery: '',
      setIsSearchOpen: jest.fn(),
      setSearchQuery: jest.fn(),
      updateDateFilter: jest.fn(),
      workingActivityId: null,
      hasMore: false,
      ...overrides,
    };
  }

  beforeEach(() => {
    addActivityTrack.mockReset();
    fetchNextPage.mockReset();
    refetch.mockReset();
    mockUseAddTrackPage.mockReturnValue(makeHookState());
  });

  it('shows route workouts and forwards the chosen activity to the add action', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<AddTrackPage />);

    expect(screen.getByText('Morning run')).toBeOnTheScreen();
    expect(screen.getByText('42 points')).toBeOnTheScreen();
    await user.press(screen.getByTestId(`add-activity-track-${activity.id}`));
    expect(addActivityTrack).toHaveBeenCalledWith(activity);
  });

  it('shows a loading state while the first route page is loading', async () => {
    mockUseAddTrackPage.mockReturnValue(makeHookState({ activities: [], isLoading: true }));
    await renderWithProviders(<AddTrackPage />);

    expect(screen.getByTestId('route-workouts-loading')).toBeOnTheScreen();
  });

  it('offers a retry when the initial route request fails', async () => {
    mockUseAddTrackPage.mockReturnValue(makeHookState({ activities: [], isError: true }));
    const user = userEvent.setup();
    await renderWithProviders(<AddTrackPage />);

    await user.press(screen.getByText(MAPS_PAGE_COPY[LANGUAGES.english].retry));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('keeps routes visible and offers retry when refreshing fails', async () => {
    mockUseAddTrackPage.mockReturnValue(makeHookState({ isError: true }));
    const user = userEvent.setup();
    await renderWithProviders(<AddTrackPage />);

    expect(screen.getByText('Morning run')).toBeOnTheScreen();
    await user.press(screen.getByText(MAPS_PAGE_COPY[LANGUAGES.english].retry));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state when there are no route workouts', async () => {
    mockUseAddTrackPage.mockReturnValue(makeHookState({ activities: [] }));
    await renderWithProviders(<AddTrackPage />);

    expect(screen.getByText(MAPS_PAGE_COPY[LANGUAGES.english].noActivities)).toBeOnTheScreen();
  });

  it('loads another page when needed and avoids duplicate page requests', async () => {
    mockUseAddTrackPage.mockReturnValue(makeHookState({ hasMore: true }));
    const { rerender } = await renderWithProviders(<AddTrackPage />);
    await act(async () => screen.getByTestId('route-workout-list').props.onEndReached());
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    mockUseAddTrackPage.mockReturnValue(makeHookState({ hasMore: true, isFetchingNextPage: true }));
    await rerender(<AddTrackPage />);
    expect(screen.getByTestId('route-workouts-loading-more')).toBeOnTheScreen();
    await act(async () => screen.getByTestId('route-workout-list').props.onEndReached());
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });
});
