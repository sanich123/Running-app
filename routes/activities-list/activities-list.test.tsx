import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivitiesList from './activities-list';

const mockUseActivitiesQuery = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ ids: ['ids=activity-1', 'activity-2, activity-3'] }),
}));
jest.mock('@R/services/activity/activity', () => ({
  ...jest.requireActual('@R/services/activity/activity'),
  useGetSeveralActivitiesByTheirIdsQuery: (...args: unknown[]) => mockUseActivitiesQuery(...args),
}));

describe('ActivitiesList', () => {
  beforeEach(() => {
    mockUseActivitiesQuery.mockReturnValue({ isSuccess: true, isLoading: false, isError: false, data: [] });
  });

  it('parses route ids and shows the empty state when no activities were found', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<ActivitiesList />);

    expect(mockUseActivitiesQuery).toHaveBeenCalledWith({ ids: 'activity-1,activity-2,activity-3' });
    expect(screen.getByText(EMPTY_STATE_COPY[LANGUAGES.russian].activities.title)).toBeOnTheScreen();
  });
});
