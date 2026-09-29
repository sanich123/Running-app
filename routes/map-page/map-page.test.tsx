import { screen } from '@testing-library/react-native';
import { http } from 'msw';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import MapPage from './map-page';

const mockSearchParams: { id?: string; replay?: string; userId?: string } = { id: MOCK_SERVER_IDS.activityId };

jest.mock('expo-router', () => ({ useLocalSearchParams: () => mockSearchParams }));
jest.mock('@S/display-activity-map/display-activity-map', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="display-activity-map" />;
});
jest.mock('@S/activity-route-replay/activity-route-replay', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="activity-route-replay" />;
});

describe('MapPage', () => {
  beforeEach(() => {
    mockSearchParams.id = MOCK_SERVER_IDS.activityId;
    delete mockSearchParams.replay;
    delete mockSearchParams.userId;
  });

  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.activityId}/locations`, loadingResponse));
    await renderWithProviders(<MapPage />);
    expect(screen.getByTestId('map-page-loading')).toBeOnTheScreen();
  });

  it('renders map with server locations', async () => {
    await renderWithProviders(<MapPage />);
    expect(await screen.findByTestId('display-activity-map')).toBeOnTheScreen();
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.activityId}/locations`, errorResponse));
    await renderWithProviders(<MapPage />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });

  it('renders route replay when requested with a profile id', async () => {
    mockSearchParams.replay = '1';
    mockSearchParams.userId = MOCK_SERVER_IDS.userId;
    await renderWithProviders(<MapPage />);

    expect(await screen.findByTestId('activity-route-replay')).toBeOnTheScreen();
    expect(screen.queryByTestId('display-activity-map')).toBeNull();
  });

  it('renders nothing when no activity id is provided', async () => {
    delete mockSearchParams.id;
    await renderWithProviders(<MapPage />);

    expect(screen.queryByTestId('map-page-loading')).toBeNull();
    expect(screen.queryByTestId('display-activity-map')).toBeNull();
    expect(screen.queryByTestId('activity-route-replay')).toBeNull();
  });
});
