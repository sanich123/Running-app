import { act, screen } from '@testing-library/react-native';
import { http } from 'msw';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_SERVER_ACTIVITY, MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentFullViewPage from './comment-page';

let mockFabOnPress: () => void;
let mockFabIcon = '';

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: MOCK_SERVER_IDS.activityId }) }));
jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  const { View } = jest.requireActual('react-native');
  return {
    ...actual,
    FAB: ({ icon, onPress }: { icon: string; onPress: () => void }) => {
      mockFabOnPress = onPress;
      mockFabIcon = icon;
      return <View testID="floatingBtn" />;
    },
  };
});
jest.mock('@S/card/like-btn/like-btn', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="comment-like-button" />;
});
jest.mock('@S/card/likes/likes', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="comment-likes" />;
});
jest.mock('@S/card/media-list/media-list', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="comment-media" />;
});
jest.mock('@Routes/comment-page/user-name-surname/user-name-surname', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="comment-user" />;
});
jest.mock('@Routes/comment-page/user-sport-date/user-sport-date', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="comment-sport-date" />;
});
jest.mock('@S/comments/comments/comments', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="comments-list" />;
});
jest.mock('@S/comments/comment-input/comment-input', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="comment-input" />;
});

describe('CommentFullViewPage', () => {
  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/activity/activityId/${MOCK_SERVER_IDS.activityId}`, loadingResponse));
    await renderWithProviders(<CommentFullViewPage />);
    expect(screen.getByTestId('comment-page-loading')).toBeOnTheScreen();
  });

  it('renders server activity and opens the comment input', async () => {
    await renderWithProviders(<CommentFullViewPage />);
    expect(await screen.findByText(MOCK_SERVER_ACTIVITY.title)).toBeOnTheScreen();
    expect(screen.getByTestId('floatingBtn')).toBeOnTheScreen();
    expect(mockFabIcon).toBe('plus');
    await act(async () => mockFabOnPress());
    expect(await screen.findByTestId('comment-input')).toBeOnTheScreen();
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/activity/activityId/${MOCK_SERVER_IDS.activityId}`, errorResponse));
    await renderWithProviders(<CommentFullViewPage />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
