import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { MAX_ACTIVITY_MEDIA } from '@Routes/save-activity-page/upload-photos-btn/ const';
import { renderWithProviders } from '@T/utils/test-utils';
import type * as AddActivityMediaBtnModule from './add-activity-media-btn';

const mockGetAccessToGallery = jest.fn();

jest.mock('@U/file-sending', () => ({
  ...jest.requireActual('@U/file-sending'),
  getAccessToGallery: (...args: unknown[]) => mockGetAccessToGallery(...args),
}));

const AddActivityMediaBtn = require('./add-activity-media-btn').default as typeof AddActivityMediaBtnModule.default;

describe('AddActivityMediaBtn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccessToGallery.mockResolvedValue({ assets: [], canceled: true });
  });

  it('opens the image picker with the remaining media capacity', async () => {
    const user = userEvent.setup();

    await renderWithProviders(<AddActivityMediaBtn activityId="activity-id" media={[]} />);
    await user.press(screen.getByTestId('activity-card-add-media-button'));

    await waitFor(() =>
      expect(mockGetAccessToGallery).toHaveBeenCalledWith(
        ['images'],
        expect.objectContaining({ allowsMultipleSelection: true, selectionLimit: MAX_ACTIVITY_MEDIA }),
      ),
    );
  });
});
