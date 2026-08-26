import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES, ROUTES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { setCommentActivityId } from '@R/slices/comment/comment';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_COMMENTS } from '@T/mocks/mock-comments';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import Comments from './comments';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

const mockPathname = `/${ROUTES.home}/${ROUTES.activity}/someActivityId`;
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => mockPathname,
}));

describe('Comments', () => {
  beforeEach(() => {
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(setCommentActivityId('someActivityId'));
  });

  it('shows a skeleton during the initial comments request', async () => {
    server.use(
      http.get(`${BASE_URL}/comment/someActivityId`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ comments: [] });
      }),
    );

    await renderWithProviders(
      <Comments commentsModalRef={{ current: { snapToIndex: jest.fn() } as unknown as BottomSheetModalMethods }} />,
      { store: mockStore },
    );

    expect(screen.getByTestId('comments-skeleton')).toBeOnTheScreen();
    expect(await screen.findByText('Комментариев пока нет')).toBeOnTheScreen();
  });

  it('shows the empty state without a loading indicator when there are no comments', async () => {
    server.use(http.get(`${BASE_URL}/comment/someActivityId`, () => HttpResponse.json({ comments: [] })));
    await renderWithProviders(
      <Comments commentsModalRef={{ current: { snapToIndex: jest.fn() } as unknown as BottomSheetModalMethods }} />,
      { store: mockStore },
    );
    expect(await screen.findByText('Комментариев пока нет')).toBeOnTheScreen();
    expect(screen.queryByTestId('commentsActivityIndicator')).not.toBeOnTheScreen();
  });

  it('should correctly renders with isLoading state and data from server in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <Comments commentsModalRef={{ current: { snapToIndex: jest.fn() } as unknown as BottomSheetModalMethods }} />,
      { store: mockStore },
    );
    expect(await screen.findByText(MOCK_COMMENTS[0].comment)).toBeOnTheScreen();
    expect(
      await screen.findByText(new RegExp(`${formatDate(MOCK_COMMENTS[0].date, LANGUAGES.english)}`, 'i')),
    ).toBeOnTheScreen();
    expect(
      await screen.findByText(new RegExp(`${getHoursMinutes(MOCK_COMMENTS[0].date, LANGUAGES.english)}`)),
    ).toBeOnTheScreen();
  });
  it('should correctly renders with data from server in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(
      <Comments commentsModalRef={{ current: { snapToIndex: jest.fn() } as unknown as BottomSheetModalMethods }} />,

      { store: mockStore },
    );
    expect(await screen.findByText(MOCK_COMMENTS[0].comment)).toBeOnTheScreen();
    expect(
      await screen.findByText(new RegExp(`${formatDate(MOCK_COMMENTS[0].date, LANGUAGES.russian)}`, 'i')),
    ).toBeOnTheScreen();
    expect(
      await screen.findByText(new RegExp(`${getHoursMinutes(MOCK_COMMENTS[0].date, LANGUAGES.russian)}`, 'i')),
    ).toBeOnTheScreen();
  });

  it('loads the next cursor page when the user returns to the top', async () => {
    const requests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/comment/someActivityId`, ({ request }) => {
        requests.push(request.url);
        const cursor = new URL(request.url).searchParams.get('cursor');
        return HttpResponse.json(
          cursor
            ? { comments: [MOCK_COMMENTS[1]], hasMore: false, nextCursor: null }
            : { comments: [MOCK_COMMENTS[0]], hasMore: true, nextCursor: 'older-cursor' },
        );
      }),
    );

    await renderWithProviders(
      <Comments commentsModalRef={{ current: { snapToIndex: jest.fn() } as unknown as BottomSheetModalMethods }} />,
      { store: mockStore },
    );
    const commentsList = await screen.findByTestId('comments-list');
    expect(commentsList.props.enableFooterMarginAdjustment).toBe(true);

    await act(async () =>
      fireEvent(commentsList, 'scrollEndDrag', {
        nativeEvent: { contentOffset: { y: 100 }, layoutMeasurement: { height: 400 }, contentSize: { height: 800 } },
      }),
    );
    await act(async () =>
      fireEvent(commentsList, 'scrollEndDrag', {
        nativeEvent: { contentOffset: { y: 0 }, layoutMeasurement: { height: 400 }, contentSize: { height: 800 } },
      }),
    );

    await waitFor(() => expect(requests).toHaveLength(2));
    expect(new URL(requests[1]).searchParams.get('cursor')).toBe('older-cursor');
  });
});
