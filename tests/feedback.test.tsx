import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { useSendFeedbackMutation } from '@R/services/feedback/feedback';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { getAccessToGallery } from '@U/file-sending';
import FeedbackPage from '../app/feedback';
import { uploadFeedbackAttachment } from '../app/utils';

jest.mock('@R/services/feedback/feedback', () => ({ useSendFeedbackMutation: jest.fn() }));
jest.mock('@U/file-sending', () => ({ getAccessToGallery: jest.fn() }));
jest.mock('../app/utils', () => ({ uploadFeedbackAttachment: jest.fn() }));

const mockUseSendFeedbackMutation = useSendFeedbackMutation as jest.Mock;
const mockGetAccessToGallery = getAccessToGallery as jest.Mock;
const mockUploadFeedbackAttachment = uploadFeedbackAttachment as jest.Mock;

describe('feedback attachments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockUseSendFeedbackMutation.mockReturnValue([
      jest.fn(() => ({ unwrap: jest.fn().mockRejectedValue(new Error('SMTP unavailable')) })),
      { isLoading: false },
    ]);
  });

  it('shows the uploaded link and an error when feedback delivery fails', async () => {
    const user = userEvent.setup();
    const attachment = {
      url: 'https://stage-cdn.example/feedback/photo.webp',
      thumbnail: null,
    };
    mockGetAccessToGallery.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://photo.webp', fileName: 'photo.webp', mimeType: 'image/webp' }],
    });
    mockUploadFeedbackAttachment.mockResolvedValue(attachment);

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
    await user.press(screen.getByText('Send'));

    await waitFor(() => expect(screen.getByText(attachment.url)).toBeOnTheScreen());
    expect(screen.getByTestId('feedback-error')).toHaveTextContent('Could not send feedback: SMTP unavailable');
    expect(mockUploadFeedbackAttachment).toHaveBeenCalledWith('file://photo.webp', expect.any(String), {
      fileName: 'photo.webp',
      mimeType: 'image/webp',
      mediaType: 'image',
    });
  });
});
