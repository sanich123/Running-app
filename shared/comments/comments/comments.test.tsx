import { screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES, ROUTES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { setCommentActivityId, setIsShowingTextInput } from '@R/slices/comment/comment';
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
    mockStore.dispatch(setIsShowingTextInput(false));
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
});
