import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { useSendFeedbackMutation } from '@R/services/feedback/feedback';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { uploadFeedbackAttachments } from '@U/feedback-sending';
import { deleteUploadedMedia, getAccessToGallery } from '@U/file-sending';
import FeedbackPage from '../app/feedback';

jest.mock('@R/services/feedback/feedback', () => ({ useSendFeedbackMutation: jest.fn() }));
jest.mock('@U/file-sending', () => ({
  deleteUploadedMedia: jest.fn().mockResolvedValue(true),
  getAccessToGallery: jest.fn(),
}));
jest.mock('@U/feedback-sending', () => ({ uploadFeedbackAttachments: jest.fn() }));

const mockUseSendFeedbackMutation = useSendFeedbackMutation as jest.Mock;
const mockGetAccessToGallery = getAccessToGallery as jest.Mock;
const mockUploadFeedbackAttachments = uploadFeedbackAttachments as jest.Mock;
const mockDeleteUploadedMedia = deleteUploadedMedia as jest.Mock;

describe('feedback attachments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockUseSendFeedbackMutation.mockReturnValue([
      jest.fn(() => ({ unwrap: jest.fn().mockRejectedValue(new Error('SMTP unavailable')) })),
      { isLoading: false },
    ]);
  });

  it('shows previews for uploaded files, hides their URLs, and keeps links in the email request', async () => {
    const user = userEvent.setup();
    const firstAttachment = {
      url: 'https://stage-cdn.example/feedback/photo.webp',
      thumbnail: null,
    };
    const secondAttachment = {
      url: 'https://stage-cdn.example/feedback/photo-2.webp',
      thumbnail: null,
    };
    const mockSendFeedback = jest.fn(() => ({
      unwrap: jest.fn().mockRejectedValue(new Error('SMTP unavailable')),
    }));
    mockGetAccessToGallery.mockResolvedValue({
      canceled: false,
      assets: [
        { uri: 'file://photo.webp', fileName: 'photo.webp', mimeType: 'image/webp' },
        { uri: 'file://photo-2.webp', fileName: 'photo-2.webp', mimeType: 'image/webp' },
      ],
    });
    mockUploadFeedbackAttachments.mockResolvedValue([firstAttachment, secondAttachment]);
    mockUseSendFeedbackMutation.mockReturnValue([mockSendFeedback, { isLoading: false }]);

    await renderWithProviders(<FeedbackPage />);
    await user.press(screen.getByText('Report a bug'));
    await act(async () => {
      screen.getAllByRole('switch')[0].props.onChange({ nativeEvent: { value: true } });
    });
    await waitFor(() => expect(screen.getAllByRole('switch')).toHaveLength(2));
    await act(async () => {
      screen.getAllByRole('switch')[1].props.onChange({ nativeEvent: { value: true } });
    });
    await user.type(
      screen.getByPlaceholderText('Describe as precisely as possible how to reproduce the bug'),
      'A message',
    );
    await user.press(screen.getByText('Add a photo or video'));
    expect(mockGetAccessToGallery).toHaveBeenCalledWith(['images', 'videos'], {
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });
    expect(
      screen.getByText(
        'You can add up to 10 photos or videos under 100 MB total. Uploading 10 files may take a while — check your connection speed.',
      ),
    ).toBeOnTheScreen();
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
    await user.press(screen.getByText('Send'));

    await waitFor(() =>
      expect(mockSendFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ attachments: [firstAttachment, secondAttachment] }),
      ),
    );
    expect(screen.queryByText(firstAttachment.url)).not.toBeOnTheScreen();
    expect(screen.queryByText(secondAttachment.url)).not.toBeOnTheScreen();
    expect(screen.getByTestId('feedback-error')).toHaveTextContent('Could not send feedback: SMTP unavailable');
    await user.press(screen.getByTestId('feedback-remove-attachment-0'));
    await waitFor(() => expect(mockDeleteUploadedMedia).toHaveBeenCalledWith([firstAttachment.url]));
    await waitFor(() => expect(screen.queryByTestId('feedback-attachment-preview-1')).not.toBeOnTheScreen());
    expect(screen.getByTestId('feedback-attachment-preview-0').props.source).toEqual({ uri: secondAttachment.url });
    expect(mockUploadFeedbackAttachments).toHaveBeenCalledWith(
      [
        {
          fileSrc: 'file://photo.webp',
          metadata: { fileName: 'photo.webp', mimeType: 'image/webp', mediaType: 'image' },
          mediaId: expect.any(String),
        },
        {
          fileSrc: 'file://photo-2.webp',
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
      assets: [{ uri: 'file://photo.webp', type: 'image' }],
    });
    mockUploadFeedbackAttachments.mockReturnValue(uploadPromise);

    await renderWithProviders(<FeedbackPage />);
    await user.press(screen.getByText('Report a bug'));
    await act(async () => {
      screen.getAllByRole('switch')[0].props.onChange({ nativeEvent: { value: true } });
    });
    await waitFor(() => expect(screen.getAllByRole('switch')).toHaveLength(2));
    await act(async () => {
      screen.getAllByRole('switch')[1].props.onChange({ nativeEvent: { value: true } });
    });
    await user.type(
      screen.getByPlaceholderText('Describe as precisely as possible how to reproduce the bug'),
      'A message',
    );
    await user.press(screen.getByText('Add a photo or video'));

    await waitFor(() => expect(screen.getByTestId('feedback-pending-attachment-preview-0')).toBeOnTheScreen());
    expect(screen.getByTestId('feedback-pending-attachment-preview-0').props.source).toEqual({
      uri: 'file://photo.webp',
    });

    await act(async () => {
      resolveUpload([{ url: 'https://stage-cdn.example/feedback/photo.webp', thumbnail: null }]);
    });
    await waitFor(() => expect(screen.getByTestId('feedback-attachment-preview-0')).toBeOnTheScreen());
    expect(screen.queryByTestId('feedback-pending-attachment-preview-0')).not.toBeOnTheScreen();
  });
});
