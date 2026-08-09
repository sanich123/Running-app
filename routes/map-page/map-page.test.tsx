import { screen } from '@testing-library/react-native';
import { http } from 'msw';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import MapPage from './map-page';

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: MOCK_SERVER_IDS.activityId }) }));
jest.mock('@S/display-activity-map/display-activity-map', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="display-activity-map" />;
});

describe('MapPage', () => {
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
});
