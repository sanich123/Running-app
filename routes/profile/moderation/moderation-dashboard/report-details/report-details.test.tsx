import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import ReportDetails from './report-details';
import { MODERATION_DASHBOARD_COPY } from '../../const';
import type { ModerationAppealItem, ModerationReportItem } from '@R/services/moderation/types';

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
    expect(screen.getByText(`${copy.details}: Repeated advertisement`)).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('moderation-action-hide_content'));
    expect(onOpenDecision).toHaveBeenCalledWith({ kind: 'action', action: 'hide_content' });
  });

  it('shows appeal actions only while the appeal is pending', async () => {
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
    fireEvent.press(screen.getByText(copy.upholdAppeal));
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
});
