import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { TEST_URLS } from '@T/mocks/const';
import { renderWithProviders } from '@T/utils/test-utils';
import ReportContext from './report-context';
import { MODERATION_DASHBOARD_COPY } from '../../const';
import type { ModerationReportItem } from '@R/services/moderation/types';

const report: ModerationReportItem = {
  id: 'report-1',
  reporterId: null,
  targetType: 'group',
  targetId: 'group-1',
  subjectUserId: null,
  reason: 'spam',
  details: null,
  status: 'open',
  priority: 'normal',
  assignedModeratorId: null,
  createdAt: '2026-10-20T12:00:00.000Z',
  reviewedAt: null,
};

describe('ReportContext', () => {
  it('shows group media context and opens its URL', async () => {
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await renderWithProviders(
      <ReportContext
        report={report}
        context={{ title: 'Saturday runners', url: TEST_URLS.cdnExamplePhoto }}
        copy={MODERATION_DASHBOARD_COPY[LANGUAGES.english]}
      />,
    );

    expect(screen.getByText('Saturday runners')).toBeOnTheScreen();
    expect(screen.getByTestId('moderation-open-media')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('moderation-open-media'));
    await waitFor(() => expect(openUrl).toHaveBeenCalledWith(TEST_URLS.cdnExamplePhoto));
    openUrl.mockRestore();
  });

  it('uses the thumbnail for a scanned video upload', async () => {
    await renderWithProviders(
      <ReportContext
        report={{ ...report, targetType: 'media_upload' }}
        context={{
          url: TEST_URLS.exampleVideo,
          thumbnail: TEST_URLS.cdnExampleVideoThumbnail,
          contentType: 'video/mp4',
          moderationStatus: 'review_required',
          frameCount: 12,
          scores: { Porn: 0.5 },
        }}
        copy={MODERATION_DASHBOARD_COPY[LANGUAGES.english]}
      />,
    );

    expect(screen.getByTestId('moderation-video-upload-preview').props.source).toEqual({
      uri: TEST_URLS.cdnExampleVideoThumbnail,
    });
    expect(screen.getByText(`${MODERATION_DASHBOARD_COPY[LANGUAGES.english].framesChecked}: 12`)).toBeOnTheScreen();
    expect(screen.getByText(/Porn 50.0%/)).toBeOnTheScreen();
  });
});
