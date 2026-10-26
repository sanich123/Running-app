import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { getErrorMessageFromError } from '@S/error-toast/error-toast';
import { TEST_URLS } from '@T/mocks/const';
import { BAD_REQUEST } from '@T/mocks/mock-requests';
import { BASE_URL } from '@T/utils/handlers';
import { setMockUserId, mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { PROFILE_MEDIA } from '../const';
import ProfileMediaPhotos from './profile-media-photos';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => 'somePathname',
}));
describe('Profile media photos', () => {
  beforeEach(() => mockPush.mockClear());
  afterEach(async () => {
    await act(async () => mockStore.dispatch(setMockUserId('')));
  });

  it('should correctly renders data in english', async () => {
    await act(async () => mockStore.dispatch(changeLanguage(LANGUAGES.english)));
    await renderWithProviders(<ProfileMediaPhotos userId="someUserId" />, { store: mockStore });
    expect(await screen.findByText(new RegExp(`${PROFILE_MEDIA.english.label}`))).toBeOnTheScreen();
  });
  it('should correctly renders data in russian', async () => {
    await act(async () => mockStore.dispatch(changeLanguage(LANGUAGES.russian)));
    await renderWithProviders(<ProfileMediaPhotos userId="someUserId" />, { store: mockStore });
    expect(await screen.findByText(new RegExp(`${PROFILE_MEDIA.russian.label}`))).toBeOnTheScreen();
  });
  it('should correctly handle an error in russian', async () => {
    await act(async () => mockStore.dispatch(changeLanguage(LANGUAGES.russian)));
    await renderWithProviders(<ProfileMediaPhotos userId="someWrongUserId" />, { store: mockStore });
    expect(
      await screen.findByText(
        new RegExp(`${PROFILE_MEDIA.russian.error}: ${getErrorMessageFromError({ status: 400, data: BAD_REQUEST })}`),
      ),
    ).toBeOnTheScreen();
  });
  it('should correctly handle an error in english', async () => {
    await act(async () => mockStore.dispatch(changeLanguage(LANGUAGES.english)));
    await renderWithProviders(<ProfileMediaPhotos userId="someWrongUserId" />, { store: mockStore });
    expect(
      await screen.findByText(
        new RegExp(`${PROFILE_MEDIA.english.error}: ${getErrorMessageFromError({ status: 400, data: BAD_REQUEST })}`),
      ),
    ).toBeOnTheScreen();
  });

  it('opens the complete media grid', async () => {
    await act(async () => mockStore.dispatch(changeLanguage(LANGUAGES.english)));
    await renderWithProviders(<ProfileMediaPhotos userId="someUserId" />);
    await fireEvent.press(await screen.findByTestId('profile-activity-media-0'));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.mediaGrid}/someUserId`);
  });

  it('offers media deletion after a long press only to the profile owner', async () => {
    const mediaId = 'media-id';
    const activityId = 'activity-id';
    const mediaUrl = TEST_URLS.profilePhoto;
    let deleteCalls = 0;
    server.use(
      http.get(`${BASE_URL}/activity/someUserId/media`, () =>
        HttpResponse.json({
          media: [
            {
              id: mediaId,
              activityId,
              url: mediaUrl,
              thumbnail: null,
              blurhash: null,
              mediaReviewStatus: 'processing',
            },
          ],
          hasMore: false,
          nextCursor: null,
          isLastPage: true,
        }),
      ),
      http.delete(`${BASE_URL}/activity/${activityId}/media/${mediaId}`, () => {
        deleteCalls += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await act(async () => mockStore.dispatch(setMockUserId('someUserId')));

    await renderWithProviders(<ProfileMediaPhotos userId="someUserId" />);
    await fireEvent(await screen.findByTestId(`profile-activity-media-${mediaId}`), 'longPress');

    expect(screen.getByTestId('activity-media-delete-button')).toBeOnTheScreen();
    expect(screen.queryByTestId('media-moderation-placeholder')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('activity-media-delete-button'));

    await waitFor(() => expect(screen.queryByTestId('activity-media-delete-button')).not.toBeOnTheScreen());
    expect(deleteCalls).toBe(1);
  });

  it('does not offer deletion on someone else profile', async () => {
    const mediaId = 'media-id';
    server.use(
      http.get(`${BASE_URL}/activity/someUserId/media`, () =>
        HttpResponse.json({
          media: [{ id: mediaId, activityId: 'activity-id', url: TEST_URLS.profilePhoto }],
          hasMore: false,
          nextCursor: null,
          isLastPage: true,
        }),
      ),
    );
    await act(async () => mockStore.dispatch(setMockUserId('viewer-id')));

    await renderWithProviders(<ProfileMediaPhotos userId="someUserId" />);
    await fireEvent(await screen.findByTestId(`profile-activity-media-${mediaId}`), 'longPress');
    expect(screen.queryByTestId('activity-media-delete-button')).not.toBeOnTheScreen();
  });

  it('shows processing status icons to profile visitors', async () => {
    const pendingPhoto = {
      id: 'pending-media-id',
      activityId: 'activity-id',
      url: 'https://images.example.test/processing-photo.jpg',
      thumbnail: null,
      mediaReviewStatus: 'processing',
    };
    server.use(
      http.get(`${BASE_URL}/activity/someUserId/media`, () =>
        HttpResponse.json({
          media: [pendingPhoto],
          hasMore: false,
          nextCursor: null,
          isLastPage: true,
        }),
      ),
    );
    await act(async () => mockStore.dispatch(setMockUserId('viewer-id')));
    await renderWithProviders(<ProfileMediaPhotos userId="someUserId" />);

    expect(await screen.findByTestId('media-moderation-placeholder')).toBeOnTheScreen();
  });
});
