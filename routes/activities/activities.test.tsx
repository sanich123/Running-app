import { fireEvent, screen } from '@testing-library/react-native';
import { http } from 'msw';
import { setUserId } from '@R/slices/auth/auth';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_SERVER_ACTIVITY, MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import Activities from './activities';

const mockNextPage = jest.fn();

jest.mock('@S/infinite-scroll-list/infinite-scroll-list', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return function MockInfiniteScrollList({ dataToRender, nextPageCallback }: any) {
    mockNextPage.mockImplementation(nextPageCallback);
    return (
      <Pressable testID="activities-next-page" onPress={mockNextPage}>
        <Text>{dataToRender[0]?.title}</Text>
      </Pressable>
    );
  };
});

describe('Activities', () => {
  beforeEach(() => mockStore.dispatch(setUserId(MOCK_SERVER_IDS.userId)));

  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.userId}`, loadingResponse));
    await renderWithProviders(<Activities />);
    expect(screen.getByTestId('userProfilePageActivityIndicator')).toBeOnTheScreen();
  });

  it('renders server data and requests the next page', async () => {
    await renderWithProviders(<Activities />);
    expect(await screen.findByText(MOCK_SERVER_ACTIVITY.title)).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('activities-next-page'));
    expect(mockNextPage).toHaveBeenCalledTimes(1);
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.userId}`, errorResponse));
    await renderWithProviders(<Activities />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
