import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/language/language';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { FOLLOW_UNFOLLOW_BTN } from './const';
import FollowUnfollowBtn from './follow-unfollow-btn';

describe('Delete friend btn', () => {
  it('should correctly renders as unfollow btn, when passed friendId is in an array of friends of the user', async () => {
    mockStore.dispatch(setUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<FollowUnfollowBtn friendId="f38e13df-1ee3-49d8-81df-8327f2b1f728" />, {
      store: mockStore,
    });
    expect(await screen.findByText(FOLLOW_UNFOLLOW_BTN.english.unfollow)).toBeOnTheScreen();
  });
  it('should correctly renders as follow btn, when passed friendId is not in an array of friends of the user', async () => {
    mockStore.dispatch(setUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<FollowUnfollowBtn friendId="someWrongFriendId" />, { store: mockStore });
    expect(await screen.findByText(FOLLOW_UNFOLLOW_BTN.english.follow)).toBeOnTheScreen();
  });
  it('should correctly renders as unfollow btn in russian, when passed friendId is in an array of friends of the user', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    await renderWithProviders(<FollowUnfollowBtn friendId="f38e13df-1ee3-49d8-81df-8327f2b1f728" />, {
      store: mockStore,
    });
    expect(await screen.findByText(FOLLOW_UNFOLLOW_BTN.russian.unfollow)).toBeOnTheScreen();
  });
  it('should correctly renders as follow btn in russian, when passed friendId is not in an array of friends of the user', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    await renderWithProviders(<FollowUnfollowBtn friendId="someWrongFriendId" />, { store: mockStore });
    expect(await screen.findByText(FOLLOW_UNFOLLOW_BTN.russian.follow)).toBeOnTheScreen();
  });

  it('follows a user after pressing Follow', async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    server.use(
      http.post(`${BASE_URL}/friend/someWrongFriendId`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: 'friend-row-id' }, { status: 201 });
      }),
    );
    await renderWithProviders(<FollowUnfollowBtn friendId="someWrongFriendId" />);
    await user.press(await screen.findByText(FOLLOW_UNFOLLOW_BTN.english.follow));
    await waitFor(() => expect(requestBody).toEqual({ userId: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b' }));
  });

  it('unfollows a user after pressing Unfollow', async () => {
    const user = userEvent.setup();
    let deletedUrl = '';
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    server.use(
      http.delete(`${BASE_URL}/friend/:friendRowId`, ({ request }) => {
        deletedUrl = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderWithProviders(<FollowUnfollowBtn friendId="f38e13df-1ee3-49d8-81df-8327f2b1f728" />);
    await user.press(await screen.findByText(FOLLOW_UNFOLLOW_BTN.english.unfollow));
    await waitFor(() => expect(deletedUrl).toContain('/friend/d228dbe1-c95a-406a-847e-1de9fdfe0145'));
  });
});
