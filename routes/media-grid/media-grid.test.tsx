import { act, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_SERVER_IDS, MOCK_SERVER_PHOTOS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { MEDIA_GRID_COLUMNS } from './const';
import MediaGrid from './media-grid';

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: MOCK_SERVER_IDS.userId }) }));
jest.mock('./image/image', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="media-grid-image" />;
});

describe('MediaGrid', () => {
  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.userId}/media`, loadingResponse));
    await renderWithProviders(<MediaGrid />);
    expect(screen.getByTestId('media-grid-loading')).toBeOnTheScreen();
  });

  it('renders server photos and loads more at the end', async () => {
    const cursors: string[] = [];
    server.use(
      http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.userId}/media`, ({ request }) => {
        cursors.push(new URL(request.url).searchParams.get('cursor') ?? '');
        return HttpResponse.json({
          ...MOCK_SERVER_PHOTOS,
          media: cursors.length > 1 ? [] : MOCK_SERVER_PHOTOS.media,
          hasMore: cursors.length === 1,
          nextCursor: cursors.length === 1 ? 'next-cursor' : null,
        });
      }),
    );
    await renderWithProviders(<MediaGrid />);
    expect(await screen.findByTestId('media-grid-image')).toBeOnTheScreen();
    const list = screen.getByTestId('media-grid-list');
    expect(list.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ width: expect.any(Number) })]));
    expect(list.props.contentContainerStyle).toEqual(expect.objectContaining({ width: '100%' }));
    const secondRow = list.props.getItemLayout([], MEDIA_GRID_COLUMNS);
    expect(secondRow.offset).toBe(secondRow.length);
    await act(async () => list.props.onEndReached());
    await waitFor(() => expect(cursors).toEqual(['', 'next-cursor']));
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.userId}/media`, errorResponse));
    await renderWithProviders(<MediaGrid />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
