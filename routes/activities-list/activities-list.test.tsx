import { screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivitiesList from './activities-list';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ ids: ['ids=activity-1', 'activity-2, activity-3'] }),
}));

describe('ActivitiesList', () => {
  it('parses route ids and shows the empty state when no activities were found', async () => {
    const requestedIds: string[] = [];
    server.use(
      http.get(`${BASE_URL}/activity/activityIds`, ({ request }) => {
        requestedIds.push(new URL(request.url).searchParams.get('ids') ?? '');
        return HttpResponse.json([]);
      }),
    );
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<ActivitiesList />);

    expect(requestedIds).toContain('activity-1,activity-2,activity-3');
    expect(await screen.findByText(EMPTY_STATE_COPY[LANGUAGES.russian].activities.title)).toBeOnTheScreen();
  });
});
