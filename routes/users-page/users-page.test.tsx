import { act, screen } from '@testing-library/react-native';
import { http } from 'msw';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ListOfUsers from './users-page';

let mockSearchInputProps: { setIsInitial: (value: boolean) => void; setSearch: (value: string) => void };

jest.mock('@U/hooks/use-debounce', () => (value: string) => value);
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('./search-input/search-input', () => {
  const { View } = jest.requireActual('react-native');
  return (props: typeof mockSearchInputProps) => {
    mockSearchInputProps = props;
    return <View testID="mock-users-search" />;
  };
});

describe('ListOfUsers', () => {
  async function startSearch() {
    expect(screen.getByTestId('mock-users-search')).toBeOnTheScreen();
    await act(async () => {
      mockSearchInputProps.setSearch('eliud');
      mockSearchInputProps.setIsInitial(false);
    });
  }

  it('renders loading state while searching', async () => {
    server.use(http.get(`${BASE_URL}/profile/filter`, loadingResponse));
    await renderWithProviders(<ListOfUsers />);
    await startSearch();
    expect(await screen.findByTestId('users-page-loading')).toBeOnTheScreen();
  });

  it('renders users returned by the server', async () => {
    await renderWithProviders(<ListOfUsers />);
    await startSearch();
    expect(
      await screen.findByText(new RegExp(`${MOCK_SERVER_PROFILE.name}.*${MOCK_SERVER_PROFILE.surname}`)),
    ).toBeOnTheScreen();
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/profile/filter`, errorResponse));
    await renderWithProviders(<ListOfUsers />);
    await startSearch();
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
