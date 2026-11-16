import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { TEST_URLS } from '@T/mocks/const';
import { renderWithProviders } from '@T/utils/test-utils';
import { MODERATION_DASHBOARD_COPY } from '../../const';
import ReportContext from './report-context';
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

  it('uses activity thumbnails and skips media without a preview URL', async () => {
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await renderWithProviders(
      <ReportContext
        report={{ ...report, targetType: 'activity' }}
        context={{
          description: 'Reported activity',
          media: [
            { id: 'thumbnail-only', url: null, thumbnail: TEST_URLS.cdnExamplePhoto },
            { id: 'no-preview', url: null, thumbnail: null },
          ],
        }}
        copy={MODERATION_DASHBOARD_COPY[LANGUAGES.english]}
      />,
    );

    expect(screen.getByText('Reported activity')).toBeOnTheScreen();
    expect(screen.getByTestId('moderation-activity-media-preview-thumbnail-only').props.source).toEqual({
      uri: TEST_URLS.cdnExamplePhoto,
    });
    expect(screen.queryByTestId('moderation-activity-media-preview-no-preview')).toBeNull();
    fireEvent.press(screen.getByTestId('moderation-activity-media-thumbnail-only'));
    await waitFor(() => expect(openUrl).toHaveBeenCalledWith(TEST_URLS.cdnExamplePhoto));
    openUrl.mockRestore();
  });

  it('shows a group-post video with its automatic moderation information', async () => {
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.english];
    await renderWithProviders(
      <ReportContext
        report={{ ...report, targetType: 'group_post' }}
        context={{
          comment: 'Reported group post',
          url: TEST_URLS.exampleVideo,
          contentType: 'video/mp4',
          mediaStatus: 'approved',
          modelVersion: 'nsfwjs-2.4.2',
        }}
        copy={copy}
      />,
    );

    expect(screen.getByText('Reported group post')).toBeOnTheScreen();
    expect(screen.getByTestId('moderation-group-post-video-preview-fallback')).toBeOnTheScreen();
    expect(screen.getByText(`${copy.mediaCheckStatus}: ${copy.mediaStatus.approved}`)).toBeOnTheScreen();
    expect(screen.getByText(`${copy.modelVersion}: nsfwjs-2.4.2`)).toBeOnTheScreen();
    expect(screen.getByTestId('moderation-open-media')).toBeOnTheScreen();
  });

  it('shows an image and partial moderation data when optional media fields are absent', async () => {
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.english];
    await renderWithProviders(
      <ReportContext
        report={{ ...report, targetType: 'media' }}
        context={{ url: TEST_URLS.cdnExamplePhoto, frameCount: 2 }}
        copy={copy}
      />,
    );

    expect(screen.getByTestId('moderation-reported-media-image-preview').props.source).toEqual({
      uri: TEST_URLS.cdnExamplePhoto,
    });
    expect(screen.getByText(`${copy.framesChecked}: 2`)).toBeOnTheScreen();
    expect(screen.queryByText(new RegExp(copy.mediaCheckStatus))).toBeNull();
    expect(screen.queryByText(new RegExp(copy.contentType))).toBeNull();
  });
});
