import { screen } from '@testing-library/react-native';
import { http } from 'msw';
import { ERROR_COMPONENT_TEST_ID } from '@Routes/error-component/const';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import CardFullView from './card-full-view';

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: MOCK_SERVER_IDS.activityId }) }));
jest.mock('@Routes/card/card', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="full-view-card" />;
});
jest.mock('./metrics/metrics', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="full-view-metrics" />;
});
jest.mock('./km-split/km-split', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="full-view-km-split" />;
});

describe('CardFullView', () => {
  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/activity/activityId/${MOCK_SERVER_IDS.activityId}`, loadingResponse));
    await renderWithProviders(<CardFullView />);
    expect(screen.getByTestId('homeActivityIndicator')).toBeOnTheScreen();
  });

  it('renders activity returned by the server', async () => {
    await renderWithProviders(<CardFullView />);
    expect(await screen.findByTestId('full-view-card')).toBeOnTheScreen();
    expect(screen.getByTestId('full-view-metrics')).toBeOnTheScreen();
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/activity/activityId/${MOCK_SERVER_IDS.activityId}`, errorResponse));
    await renderWithProviders(<CardFullView />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
