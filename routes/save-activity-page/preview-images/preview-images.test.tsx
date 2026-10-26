import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MEDIA_MODERATION_PLACEHOLDER_COPY } from '@S/media-moderation-placeholder/const';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { deleteUploadedMedia } from '@U/file-sending';
import PreviewImages from './preview-images';

jest.mock('@U/file-sending', () => ({ deleteUploadedMedia: jest.fn().mockResolvedValue(true) }));
const mockDeleteUploadedMedia = deleteUploadedMedia as jest.MockedFunction<typeof deleteUploadedMedia>;

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));
describe('Preview images', () => {
  beforeEach(() => mockStore.dispatch(changeLanguage(LANGUAGES.russian)));

  it('should correctly renders image', async () => {
    const setImages = jest.fn();
    await renderWithProviders(
      <PreviewImages images={[{ url: 'someUrl', thumbnail: null }]} setImages={setImages} isDisabled={false} />,
      {
        store: mockStore,
      },
    );
    const image = screen.getByTestId('imagePreview-0');
    expect(image).toBeOnTheScreen();
    expect(image.props.source.uri).toEqual('someUrl');
  });
  it('renders compact camera previews in a horizontal list', async () => {
    const setImages = jest.fn();
    await renderWithProviders(
      <PreviewImages
        images={[
          { url: 'someUrl', thumbnail: null },
          { url: 'someOtherUrl', thumbnail: null },
          { url: 'thirdUrl', thumbnail: null },
          { url: 'fourthUrl', thumbnail: null },
        ]}
        setImages={setImages}
        isDisabled={false}
        compact
        horizontal
      />,
      { store: mockStore },
    );
    expect(screen.getByTestId('horizontal-preview-list').props.horizontal).toBe(true);
    expect(screen.getByTestId('imagePreview-3')).toBeOnTheScreen();
  });
  it('hides moderation status icons from the user who uploaded the photo', async () => {
    const copy = MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian];

    await renderWithProviders(
      <PreviewImages
        images={[{ url: 'someUrl', thumbnail: null, mediaReviewStatus: 'review_required' }]}
        setImages={jest.fn()}
        isDisabled={false}
        compact
        horizontal
      />,
      { store: mockStore },
    );

    expect(screen.queryByText(copy.reviewRequired)).toBeNull();
    expect(screen.queryByTestId('media-moderation-placeholder')).toBeNull();
  });
  it('should correctly delete and image', async () => {
    const setImages = jest.fn();
    await renderWithProviders(
      <PreviewImages images={[{ url: 'someUrl', thumbnail: null }]} setImages={setImages} isDisabled={false} />,
      {
        store: mockStore,
      },
    );
    const deleteBtn = screen.getByTestId('deleteIcon');
    expect(deleteBtn).toBeOnTheScreen();
    await userEvent.press(deleteBtn);
    expect(setImages).toHaveBeenCalled();
    expect(mockDeleteUploadedMedia).toHaveBeenCalledWith(['someUrl'], []);
  });

  it('deletes persisted activity media by its activity media id', async () => {
    const activityId = 'edit-activity-id';
    const mediaId = 'persisted-media-id';
    const setImages = jest.fn();
    let didDeletePersistedMedia = false;
    mockDeleteUploadedMedia.mockClear();
    server.use(
      http.delete(`${BASE_URL}/activity/${activityId}/media/${mediaId}`, () => {
        didDeletePersistedMedia = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await renderWithProviders(
      <PreviewImages
        images={[{ id: mediaId, activityId, url: 'persisted-photo', thumbnail: 'persisted-thumbnail' }]}
        setImages={setImages}
        isDisabled={false}
        activityId={activityId}
        isPersistedActivityMedia
      />,
      { store: mockStore },
    );

    await userEvent.press(screen.getByTestId('deleteIcon'));

    await waitFor(() => expect(didDeletePersistedMedia).toBe(true));
    expect(setImages).toHaveBeenCalledWith([]);
    expect(mockDeleteUploadedMedia).not.toHaveBeenCalled();
  });
});
