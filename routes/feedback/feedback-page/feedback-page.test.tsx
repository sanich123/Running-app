import { act, fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { TEST_URLS } from '@T/mocks/const';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { uploadFeedbackAttachments } from '@U/feedback-sending';
import { deleteUploadedMedia, getAccessToGallery } from '@U/file-sending';
import { FEEDBACK_TEXT } from '../const';
import FeedbackPage from './feedback-page';

jest.mock('@U/file-sending', () => ({
  deleteUploadedMedia: jest.fn().mockResolvedValue(true),
  getAccessToGallery: jest.fn(),
}));
jest.mock('@U/feedback-sending', () => ({ uploadFeedbackAttachments: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));

const mockGetAccessToGallery = getAccessToGallery as jest.Mock;
const mockUploadFeedbackAttachments = uploadFeedbackAttachments as jest.Mock;
const mockDeleteUploadedMedia = deleteUploadedMedia as jest.Mock;

describe('feedback attachments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setMockUserId('feedback-test-user'));
  });

  it('shows previews for uploaded files, hides their URLs, and keeps links in the email request', async () => {
    const user = userEvent.setup();
    const firstAttachment = {
      url: TEST_URLS.stageFeedbackPhoto,
      thumbnail: null,
    };
    const secondAttachment = {
      url: TEST_URLS.stageFeedbackSecondPhoto,
      thumbnail: null,
    };
    const submittedFeedback: unknown[] = [];
    server.use(
      http.post(`${BASE_URL}/email/feedback`, async ({ request }) => {
        submittedFeedback.push(await request.json());
        return HttpResponse.json({ message: 'SMTP unavailable' }, { status: 500 });
      }),
    );
    mockGetAccessToGallery.mockResolvedValue({
      canceled: false,
      assets: [
        { uri: TEST_URLS.feedbackPhotoFileUri, fileName: 'photo.webp', mimeType: 'image/webp' },
        { uri: TEST_URLS.feedbackSecondPhotoFileUri, fileName: 'photo-2.webp', mimeType: 'image/webp' },
      ],
    });
    mockUploadFeedbackAttachments.mockResolvedValue([firstAttachment, secondAttachment]);

    await renderWithProviders(<FeedbackPage />);
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].bug));
    await user.type(screen.getByPlaceholderText(FEEDBACK_TEXT[LANGUAGES.english].bugPlaceholder), 'A message');
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].addPhoto));
    expect(mockGetAccessToGallery).toHaveBeenCalledWith(['images', 'videos'], {
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });
    expect(screen.queryByText(/You can add up to 10 photos or videos/)).not.toBeOnTheScreen();
    expect(screen.queryByText(/Device and app version are included/)).not.toBeOnTheScreen();
    await waitFor(() => expect(screen.getByTestId('feedback-attachment-preview-1')).toBeOnTheScreen());
    expect(screen.getByTestId('feedback-attachment-preview-0').props.source).toEqual({
      uri: firstAttachment.url,
    });
    expect(screen.getByTestId('feedback-attachment-preview-1').props.source).toEqual({
      uri: secondAttachment.url,
    });
    expect(screen.getByTestId('feedback-attachment-preview-0').props.style[0]).toMatchObject({
      width: 96,
      height: 96,
    });
    expect(screen.getByTestId('feedback-remove-attachment-0')).toBeOnTheScreen();
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].send));

    await waitFor(() =>
      expect(submittedFeedback).toEqual([
        expect.objectContaining({ attachments: [firstAttachment, secondAttachment] }),
      ]),
    );
    expect(screen.queryByText(firstAttachment.url)).not.toBeOnTheScreen();
    expect(screen.queryByText(secondAttachment.url)).not.toBeOnTheScreen();
    expect(screen.getByTestId('feedback-error')).toHaveTextContent(
      `${FEEDBACK_TEXT[LANGUAGES.english].submitError}: 500, SMTP unavailable`,
    );
    await user.press(screen.getByTestId('feedback-remove-attachment-0'));
    await waitFor(() =>
      expect(mockDeleteUploadedMedia).toHaveBeenCalledWith([firstAttachment.url], [], expect.any(String)),
    );
    await waitFor(() => expect(screen.queryByTestId('feedback-attachment-preview-1')).not.toBeOnTheScreen());
    expect(screen.getByTestId('feedback-attachment-preview-0').props.source).toEqual({ uri: secondAttachment.url });
    expect(mockUploadFeedbackAttachments).toHaveBeenCalledWith(
      [
        {
          fileSrc: TEST_URLS.feedbackPhotoFileUri,
          metadata: { fileName: 'photo.webp', mimeType: 'image/webp', mediaType: 'image' },
          mediaId: expect.any(String),
        },
        {
          fileSrc: TEST_URLS.feedbackSecondPhotoFileUri,
          metadata: { fileName: 'photo-2.webp', mimeType: 'image/webp', mediaType: 'image' },
          mediaId: expect.any(String),
        },
      ],
      expect.any(String),
    );
  });

  it('shows local previews while files are uploading', async () => {
    const user = userEvent.setup();
    let resolveUpload: (attachments: { url: string; thumbnail: string | null }[]) => void = () => undefined;
    const uploadPromise = new Promise<{ url: string; thumbnail: string | null }[]>((resolve) => {
      resolveUpload = resolve;
    });
    mockGetAccessToGallery.mockResolvedValue({
      canceled: false,
      assets: [{ uri: TEST_URLS.feedbackPhotoFileUri, type: 'image' }],
    });
    mockUploadFeedbackAttachments.mockReturnValue(uploadPromise);

    await renderWithProviders(<FeedbackPage />);
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].bug));
    await user.type(screen.getByPlaceholderText(FEEDBACK_TEXT[LANGUAGES.english].bugPlaceholder), 'A message');
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].addPhoto));

    await waitFor(() => expect(screen.getByTestId('feedback-pending-attachment-preview-0')).toBeOnTheScreen());
    expect(screen.getByTestId('feedback-pending-attachment-preview-0').props.source).toEqual({
      uri: TEST_URLS.feedbackPhotoFileUri,
    });

    await act(async () => {
      resolveUpload([{ url: TEST_URLS.stageFeedbackPhoto, thumbnail: null }]);
    });
    await waitFor(() => expect(screen.getByTestId('feedback-attachment-preview-0')).toBeOnTheScreen());
    expect(screen.queryByTestId('feedback-pending-attachment-preview-0')).not.toBeOnTheScreen();
  });

  it('submits a support question without attachment fields', async () => {
    const user = userEvent.setup();
    const submittedFeedback: unknown[] = [];
    server.use(
      http.post(`${BASE_URL}/email/feedback`, async ({ request }) => {
        submittedFeedback.push(await request.json());
        return HttpResponse.json({});
      }),
    );

    await renderWithProviders(<FeedbackPage />);
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].question));
    fireEvent.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].topics.account));
    await user.type(screen.getByPlaceholderText(FEEDBACK_TEXT[LANGUAGES.english].questionPlaceholder), 'I need help');
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].send));

    await waitFor(() => expect(submittedFeedback).toHaveLength(1));
    expect(submittedFeedback[0]).toMatchObject({ kind: 'question', topic: 'account', text: 'I need help' });
    expect(submittedFeedback[0]).not.toHaveProperty('attachments');
    expect(screen.queryByTestId('feedback-error')).toBeNull();
  });

  it.each([
    ['cancelled', { canceled: true, assets: [] }],
    ['empty', { canceled: false, assets: [] }],
    ['missing', undefined],
  ])('does not start an upload when the gallery result is %s', async (_description, result) => {
    const user = userEvent.setup();
    mockGetAccessToGallery.mockResolvedValueOnce(result);
    await renderWithProviders(<FeedbackPage />);
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].bug));
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].addPhoto));

    expect(mockUploadFeedbackAttachments).not.toHaveBeenCalled();
  });

  it('shows an error when the gallery cannot be opened', async () => {
    const user = userEvent.setup();
    mockGetAccessToGallery.mockRejectedValueOnce(new Error('permission denied'));
    await renderWithProviders(<FeedbackPage />);
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].bug));
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].addPhoto));

    expect(await screen.findByTestId('feedback-error')).toHaveTextContent(
      'Could not open the gallery: permission denied',
    );
    expect(mockUploadFeedbackAttachments).not.toHaveBeenCalled();
  });

  it('removes an in-flight preview and skips attaching the removed media', async () => {
    const user = userEvent.setup();
    let resolveUpload: (attachments: ({ url: string; thumbnail: string | null } | null)[]) => void = () => undefined;
    mockGetAccessToGallery.mockResolvedValue({
      canceled: false,
      assets: [{ uri: TEST_URLS.feedbackPhotoFileUri, type: 'image' }],
    });
    mockUploadFeedbackAttachments.mockReturnValue(
      new Promise((resolve) => {
        resolveUpload = resolve;
      }),
    );

    await renderWithProviders(<FeedbackPage />);
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].bug));
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].addPhoto));
    await waitFor(() => expect(screen.getByTestId('feedback-pending-attachment-preview-0')).toBeOnTheScreen());
    await user.press(screen.getByTestId('feedback-remove-pending-attachment-0'));
    await act(async () => resolveUpload([{ url: 'https://cdn.example/photo.webp', thumbnail: null }]));

    expect(screen.queryByTestId('feedback-error')).toBeNull();
    expect(screen.queryByTestId('feedback-attachment-preview-0')).toBeNull();
    expect(screen.queryByTestId('feedback-pending-attachment-preview-0')).toBeNull();
  });

  it('shows an attachment error when an upload returns no attachment', async () => {
    const user = userEvent.setup();
    mockGetAccessToGallery.mockResolvedValue({
      canceled: false,
      assets: [{ uri: TEST_URLS.feedbackPhotoFileUri, type: 'image' }],
    });
    mockUploadFeedbackAttachments.mockResolvedValue([null]);

    await renderWithProviders(<FeedbackPage />);
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].bug));
    await user.press(screen.getByText(FEEDBACK_TEXT[LANGUAGES.english].addPhoto));

    expect(await screen.findByTestId('feedback-error')).toHaveTextContent(
      FEEDBACK_TEXT[LANGUAGES.english].attachmentUploadError,
    );
    expect(screen.queryByTestId('feedback-attachment-preview-0')).toBeNull();
  });
});
