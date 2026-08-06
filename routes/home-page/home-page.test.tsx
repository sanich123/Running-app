import { fireEvent, screen } from '@testing-library/react-native';
import { http } from 'msw';
import { setUserId } from '@R/slices/auth/auth';
import { ERROR_COMPONENT_TEST_ID } from '@Routes/error-component/const';
import { MOCK_SERVER_ACTIVITY, MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import Feed from './home-page';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@Routes/infinite-scroll-list/infinite-scroll-list', () => {
  const { Text } = jest.requireActual('react-native');
  return ({ dataToRender }: any) => <Text>{dataToRender[0].title}</Text>;
});
jest.mock('@Routes/floating-btn/floating-btn', () => {
  const { Pressable } = jest.requireActual('react-native');
  return ({ onPressFn }: any) => <Pressable testID="feed-add-activity" onPress={onPressFn} />;
});

describe('Feed', () => {
  beforeEach(() => mockStore.dispatch(setUserId(MOCK_SERVER_IDS.userId)));

  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.userId}/all`, loadingResponse));
    await renderWithProviders(<Feed />);
    expect(screen.getByTestId('homeActivityIndicator')).toBeOnTheScreen();
  });

  it('renders server activities and opens manual activity', async () => {
    await renderWithProviders(<Feed />);
    expect(await screen.findByText(MOCK_SERVER_ACTIVITY.title)).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('feed-add-activity'));
    expect(mockPush).toHaveBeenCalledWith('/(protected)/manual-activity');
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.userId}/all`, errorResponse));
    await renderWithProviders(<Feed />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
