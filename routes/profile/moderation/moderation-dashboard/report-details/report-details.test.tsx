import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { MODERATION_DASHBOARD_COPY } from '../../const';
import ReportDetails from './report-details';
import type { ModerationAppealItem, ModerationReportItem } from '@R/services/moderation/types';

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockRouterPush }) }));

const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.english];
const report: ModerationReportItem = {
  id: 'report-1',
  reporterId: null,
  targetType: 'comment',
  targetId: 'comment-1',
  subjectUserId: null,
  reason: 'spam',
  details: 'Repeated advertisement',
  status: 'open',
  priority: 'normal',
  assignedModeratorId: null,
  createdAt: '2026-10-20T12:00:00.000Z',
  reviewedAt: null,
};

describe('ReportDetails', () => {
  it('shows report context and opens the available moderation action', async () => {
    const user = userEvent.setup();
    const onOpenDecision = jest.fn();
    await renderWithProviders(
      <ReportDetails
        selectedReportId="report-1"
        isLoading={false}
        isError={false}
        error={undefined}
        refetch={jest.fn()}
        reportDetails={{ report, context: { comment: 'Buy these shoes', moderationStatus: 'visible' }, actions: [] }}
        activeTab="reports"
        copy={copy}
        language={LANGUAGES.english}
        onOpenDecision={onOpenDecision}
      />,
    );

    expect(screen.getByText('Buy these shoes')).toBeOnTheScreen();
    expect(screen.getByText('Repeated advertisement')).toBeOnTheScreen();
    await user.press(screen.getByTestId('moderation-actions-report-1'));
    await user.press(screen.getByTestId('moderation-action-hide_content'));
    expect(onOpenDecision).toHaveBeenCalledWith({ kind: 'action', action: 'hide_content' });
  });

  it('shows appeal actions only while the appeal is pending', async () => {
    const user = userEvent.setup();
    const onOpenDecision = jest.fn();
    const appeal: ModerationAppealItem = {
      id: 'appeal-1',
      reportId: report.id,
      appellantId: 'user-1',
      reason: 'Please reconsider this decision',
      createdAt: '2026-10-20T13:00:00.000Z',
      status: 'pending',
    };
    await renderWithProviders(
      <ReportDetails
        selectedReportId="report-1"
        isLoading={false}
        isError={false}
        error={undefined}
        refetch={jest.fn()}
        reportDetails={{ report: { ...report, status: 'resolved' }, context: null, actions: [] }}
        selectedAppeal={appeal}
        activeTab="appeals"
        copy={copy}
        language={LANGUAGES.english}
        onOpenDecision={onOpenDecision}
      />,
    );

    expect(screen.getByText(appeal.reason)).toBeOnTheScreen();
    await user.press(screen.getByTestId('moderation-actions-report-1'));
    await user.press(screen.getByText(copy.upholdAppeal));
    expect(onOpenDecision).toHaveBeenCalledWith({ kind: 'appeal', appealId: appeal.id, decision: 'upheld' });
    expect(screen.queryByTestId('moderation-action-hide_content')).toBeNull();
  });

  it('asks the moderator to select a report when none is active', async () => {
    await renderWithProviders(
      <ReportDetails
        selectedReportId=""
        isLoading={false}
        isError={false}
        error={undefined}
        refetch={jest.fn()}
        activeTab="reports"
        copy={copy}
        language={LANGUAGES.english}
        onOpenDecision={jest.fn()}
      />,
    );

    expect(screen.getByText(copy.selectReport)).toBeOnTheScreen();
  });

  it('shows reporter identity and opens the reporter profile', async () => {
    const user = userEvent.setup();
    mockRouterPush.mockClear();
    await renderWithProviders(
      <ReportDetails
        selectedReportId="report-1"
        isLoading={false}
        isError={false}
        error={undefined}
        refetch={jest.fn()}
        reportDetails={{
          report: { ...report, reporterId: 'reporter-1' },
          reporter: {
            userId: 'reporter-1',
            name: 'Alex',
            surname: 'Reader',
            email: 'alex@example.test',
            profilePhoto: 'https://example.test/alex.jpg',
          },
          context: null,
          actions: [],
        }}
        activeTab="reports"
        copy={copy}
        language={LANGUAGES.english}
        onOpenDecision={jest.fn()}
      />,
    );

    expect(screen.getByText('Alex Reader')).toBeOnTheScreen();
    expect(screen.getByText('alex@example.test')).toBeOnTheScreen();
    await user.press(screen.getByTestId('moderation-reporter-report-1'));
    expect(mockRouterPush).toHaveBeenCalledWith('/profile/reporter-1');
  });

  it('uses fallback identity when the reporter profile has been deleted', async () => {
    await renderWithProviders(
      <ReportDetails
        selectedReportId="report-1"
        isLoading={false}
        isError={false}
        error={undefined}
        refetch={jest.fn()}
        reportDetails={{
          report: { ...report, reporterId: 'deleted-reporter' },
          reporter: {
            userId: 'deleted-reporter',
            name: null,
            surname: null,
            email: null,
            profilePhoto: null,
          },
          context: null,
          actions: [],
        }}
        activeTab="reports"
        copy={copy}
        language={LANGUAGES.english}
        onOpenDecision={jest.fn()}
      />,
    );

    expect(screen.getByText(copy.deletedReporter)).toBeOnTheScreen();
    expect(screen.queryByText(/@/)).toBeNull();
  });

  it('shows the original author for an automated media report and opens that profile', async () => {
    const user = userEvent.setup();
    mockRouterPush.mockClear();
    await renderWithProviders(
      <ReportDetails
        selectedReportId="report-1"
        isLoading={false}
        isError={false}
        error={undefined}
        refetch={jest.fn()}
        reportDetails={{
          report: { ...report, targetType: 'media_upload', subjectUserId: 'author-1' },
          contentAuthor: {
            userId: 'author-1',
            name: 'Taylor',
            surname: 'Creator',
            email: 'taylor@example.test',
            profilePhoto: 'https://example.test/taylor.jpg',
          },
          context: { mediaStatus: 'review_required', contentType: 'image/jpeg' },
          actions: [],
        }}
        activeTab="reports"
        copy={copy}
        language={LANGUAGES.english}
        onOpenDecision={jest.fn()}
      />,
    );

    expect(screen.getByText('Taylor Creator')).toBeOnTheScreen();
    expect(screen.getByText('taylor@example.test')).toBeOnTheScreen();
    await user.press(screen.getByTestId('moderation-content-author-report-1'));
    expect(mockRouterPush).toHaveBeenCalledWith('/profile/author-1');
  });

  it('offers report deletion from the actions menu', async () => {
    const user = userEvent.setup();
    const onOpenDecision = jest.fn();
    await renderWithProviders(
      <ReportDetails
        selectedReportId="report-1"
        isLoading={false}
        isError={false}
        error={undefined}
        refetch={jest.fn()}
        reportDetails={{ report, context: null, actions: [] }}
        activeTab="reports"
        copy={copy}
        language={LANGUAGES.english}
        onOpenDecision={onOpenDecision}
      />,
    );

    await user.press(screen.getByTestId('moderation-actions-report-1'));
    await user.press(screen.getByTestId('moderation-delete-report'));
    expect(onOpenDecision).toHaveBeenCalledWith({ kind: 'delete-report', reportId: report.id });
  });
});
