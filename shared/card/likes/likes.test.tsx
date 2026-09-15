import { act, screen, userEvent } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Platform } from 'react-native';
import * as router from 'expo-router';
import { setActivityIdWhichLikesToUpdate } from '@R/slices/main-feed/main-feed';
import { AvatarShowableTestIds } from '@S/avatar/showable/const';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { LIKE_BTN, LikesSize } from './const';
import Likes from './likes';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  usePathname: () => 'some string',
  useRouter: () => ({
    push: mockPush,
  }),
}));
describe('Card likes', () => {
  beforeEach(() => {
    mockStore.dispatch(setActivityIdWhichLikesToUpdate(''));
  });

  it('formats like action errors in both languages', () => {
    expect(LIKE_BTN.english.errorAction('delete')).toContain('deleting');
    expect(LIKE_BTN.english.errorAction('send')).toContain('sending');
    expect(LIKE_BTN.russian.errorAction('delete')).toContain('удаления');
    expect(LIKE_BTN.russian.errorAction('send')).toContain('отправки');
  });

  it('should correctly renders', async () => {
    jest.spyOn(router, 'usePathname').mockImplementation(() => 'some path');
    mockStore.dispatch(setMockUserId('someUserId'));
    server.use(
      http.get(`${BASE_URL}/like/617dddae-05b3-418a-9a8e-5d408a1b897a`, () =>
        HttpResponse.json([
          {
            authorId: 'someUserId',
            profile: { name: 'Some', surname: 'User', profilePhoto: 'https://example.com/avatar.jpg' },
          },
        ]),
      ),
    );
    await renderWithProviders(<Likes activityId="617dddae-05b3-418a-9a8e-5d408a1b897a" size={LikesSize.big} />, {
      store: mockStore,
    });
    expect(await screen.findByTestId('pushToActivityLikes')).toBeOnTheScreen();
    const avatar = await screen.findByTestId(AvatarShowableTestIds.success);
    expect(avatar).toBeOnTheScreen();
    expect(avatar.props.cachePolicy).toBe('memory-disk');
    expect(avatar.props.recyclingKey).toBe('someUserId');
    expect(avatar.props.transition).toBe(0);
  });

  it('renders the compact likes count', async () => {
    await renderWithProviders(<Likes activityId="617dddae-05b3-418a-9a8e-5d408a1b897a" size={LikesSize.small} />);

    expect(await screen.findByTestId('pushToActivityLikes')).toBeOnTheScreen();
  });

  it('renders an empty state when likes are skipped', async () => {
    await renderWithProviders(<Likes activityId="" size={LikesSize.big} />);

    expect(screen.queryByTestId('pushToActivityLikes')).not.toBeOnTheScreen();
  });

  it('does not request likes when the activity count is zero', async () => {
    let requests = 0;
    const activityId = 'activity-without-likes';
    server.use(
      http.get(`${BASE_URL}/like/${activityId}`, () => {
        requests += 1;
        return HttpResponse.json([]);
      }),
    );

    await renderWithProviders(<Likes activityId={activityId} size={LikesSize.small} likesLength={0} />);

    expect(requests).toBe(0);
    expect(screen.queryByTestId('pushToActivityLikes')).not.toBeOnTheScreen();
  });

  it('starts requesting likes after the activity is marked for update', async () => {
    let requests = 0;
    const activityId = 'activity-marked-for-like-update';
    server.use(
      http.get(`${BASE_URL}/like/${activityId}`, () => {
        requests += 1;
        return HttpResponse.json([
          {
            id: 'like-id',
            activityId,
            authorId: 'author-id',
            date: new Date().toISOString(),
            profile: { name: 'Runner' },
          },
        ]);
      }),
    );

    await renderWithProviders(<Likes activityId={activityId} size={LikesSize.small} likesLength={0} />);
    expect(requests).toBe(0);

    await act(async () => {
      mockStore.dispatch(setActivityIdWhichLikesToUpdate(activityId));
    });

    expect(await screen.findByTestId('pushToActivityLikes')).toBeOnTheScreen();
    expect(requests).toBe(1);
  });

  it('opens the likes modal in the web flow', async () => {
    const user = userEvent.setup();
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    await renderWithProviders(<Likes activityId="617dddae-05b3-418a-9a8e-5d408a1b897a" size={LikesSize.big} />);
    await user.press(await screen.findByTestId('pushToActivityLikes'));
    expect(mockPush).not.toHaveBeenCalled();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });
});
