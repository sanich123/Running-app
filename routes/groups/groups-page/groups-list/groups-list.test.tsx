import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupsList from './groups-list';
import { GROUPS_COPY } from '../../const';
import { GROUP_FIXTURE } from '../../test-fixtures';

const mockGetGroups = jest.fn();
const mockPush = jest.fn();
jest.mock('@R/services/groups/groups', () => ({ useGetGroupsQuery: (...args: unknown[]) => mockGetGroups(...args) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('GroupsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockGetGroups.mockReturnValue({
      data: [GROUP_FIXTURE],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('loads groups with the selected filters and opens a group', async () => {
    await renderWithProviders(<GroupsList filters={{ scope: 'all', search: 'run', sport: 'run' }} />);

    expect(mockGetGroups).toHaveBeenCalledWith({ scope: 'all', search: 'run', sport: 'run' });
    fireEvent.press(screen.getByText(GROUP_FIXTURE.name));
    expect(mockPush).toHaveBeenCalledWith(`/groups/${GROUP_FIXTURE.id}`);
  });

  it('shows the HTTP status and a retry button after a failed request', async () => {
    const refetch = jest.fn();
    mockGetGroups.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: 500, data: { statusCode: 500, message: 'Ошибка операции с базой данных' } },
      refetch,
    });
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<GroupsList filters={{ scope: 'all', search: '', sport: undefined }} />);

    expect(screen.getByText('500, Ошибка операции с базой данных')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Повторить'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows an empty search result when there are no matches', async () => {
    mockGetGroups.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<GroupsList filters={{ scope: 'all', search: 'unknown', sport: undefined }} />);

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.english].noResults)).toBeOnTheScreen();
  });
});
