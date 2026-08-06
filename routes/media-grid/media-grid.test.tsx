import { act, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ERROR_COMPONENT_TEST_ID } from '@Routes/error-component/const';
import { MOCK_SERVER_IDS, MOCK_SERVER_PHOTOS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import MediaGrid from './media-grid';

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: MOCK_SERVER_IDS.userId }) }));
jest.mock('./image/image', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="media-grid-image" />;
});

describe('MediaGrid', () => {
  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.userId}/photos`, loadingResponse));
    await renderWithProviders(<MediaGrid />);
    expect(screen.getByTestId('media-grid-loading')).toBeOnTheScreen();
  });

  it('renders server photos and loads more at the end', async () => {
    const takes: string[] = [];
    server.use(
      http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.userId}/photos`, ({ request }) => {
        takes.push(new URL(request.url).searchParams.get('take') ?? '');
        return HttpResponse.json({ ...MOCK_SERVER_PHOTOS, isLastPage: takes.length > 1 });
      }),
    );
    await renderWithProviders(<MediaGrid />);
    expect(await screen.findByTestId('media-grid-image')).toBeOnTheScreen();
    await act(async () => screen.getByTestId('media-grid-list').props.onEndReached());
    await waitFor(() => expect(takes).toEqual(['28', '56']));
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.userId}/photos`, errorResponse));
    await renderWithProviders(<MediaGrid />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
