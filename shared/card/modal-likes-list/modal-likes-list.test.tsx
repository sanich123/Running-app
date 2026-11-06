import { act, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { setActivityIdWhichLikesToDownload } from '@R/slices/main-feed/main-feed';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import { TEST_URLS } from '@T/mocks/const';
import { MOCK_SERVER_LIKES } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, resetMockMainFeed } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ModalLikesList from './modal-likes-list';

describe('modal likes list', () => {
  beforeEach(() => {
    mockStore.dispatch(resetMockMainFeed());
  });

  it('renders an empty state after a successful likes request', async () => {
    server.use(http.get(`${BASE_URL}/like/activity-1`, () => HttpResponse.json([])));
    mockStore.dispatch(setActivityIdWhichLikesToDownload('activity-1'));
    await renderWithProviders(
      <ModalLikesList bottomSheetModalRef={{ current: null }} likesLength={0} canViewLikes={true} />,
    );
    expect(await screen.findByText(EMPTY_STATE_COPY[LANGUAGES.russian].likes.title)).toBeOnTheScreen();
    expect(screen.getByText(EMPTY_STATE_COPY[LANGUAGES.russian].likes.message)).toBeOnTheScreen();
  });

  it('loads the next page when the likes list reaches its end', async () => {
    const requestedCursors: (string | null)[] = [];
    server.use(
      http.get(`${BASE_URL}/like/activity-2`, ({ request }) => {
        requestedCursors.push(new URL(request.url).searchParams.get('cursor'));
        return HttpResponse.json({ likes: [], hasMore: true, nextCursor: 'cursor-2', currentUserLike: null });
      }),
    );
    mockStore.dispatch(setActivityIdWhichLikesToDownload('activity-2'));
    await renderWithProviders(
      <ModalLikesList bottomSheetModalRef={{ current: null }} likesLength={31} canViewLikes={true} />,
    );

    expect(await screen.findByText(EMPTY_STATE_COPY[LANGUAGES.russian].likes.title)).toBeOnTheScreen();
    await waitFor(() => expect(requestedCursors).toHaveLength(1));
    await act(async () => screen.getByTestId('likes-modal-list').props.onEndReached());

    await waitFor(() => expect(requestedCursors).toHaveLength(2));
    expect(requestedCursors).toEqual([null, 'cursor-2']);
  });

  it('renders liker avatars through the cached image loader', async () => {
    server.use(
      http.get(`${BASE_URL}/like/activity-3`, () =>
        HttpResponse.json({
          likes: [
            {
              ...MOCK_SERVER_LIKES[0],
              id: 'like-1',
              authorId: 'liked-user',
              profile: {
                userId: 'liked-user',
                name: 'Liked',
                surname: 'Runner',
                profilePhoto: TEST_URLS.exampleLikedUserPhoto,
                profilePhotoBlurhash: null,
                allowNewFollowers: false,
              },
            },
          ],
          hasMore: false,
          nextCursor: null,
          currentUserLike: null,
        }),
      ),
    );
    mockStore.dispatch(setActivityIdWhichLikesToDownload('activity-3'));

    await renderWithProviders(
      <ModalLikesList bottomSheetModalRef={{ current: null }} likesLength={1} canViewLikes={true} />,
    );

    expect(await screen.findByText('Liked Runner')).toBeOnTheScreen();
  });
});
