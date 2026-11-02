import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import ReportQueue from './report-queue';
import { MODERATION_DASHBOARD_COPY } from '../../const';
import type { ModerationAppealItem, ModerationReportItem } from '@R/services/moderation/types';

const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.english];
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

describe('ReportQueue', () => {
  it('filters and selects report rows', async () => {
    const onStatusFilterChange = jest.fn();
    const onSelectReport = jest.fn();
    await renderWithProviders(
      <ReportQueue
        activeTab="reports"
        isWideLayout={false}
        showQueue
        hasQueueItems
        statusFilter="all"
        onStatusFilterChange={onStatusFilterChange}
        reports={[report]}
        appeals={[]}
        selectedReportId=""
        selectedAppealId=""
        isLoading={false}
        isError={false}
        error={undefined}
        refetch={jest.fn()}
        language={LANGUAGES.english}
        copy={copy}
        onSelectReport={onSelectReport}
        onSelectAppeal={jest.fn()}
      />,
    );

    const user = userEvent.setup();
    await user.press(screen.getByTestId('moderation-report-filter-open'));
    await user.press(screen.getByTestId('moderation-report-report-1'));

    expect(onStatusFilterChange).toHaveBeenCalledWith('open');
    expect(onSelectReport).toHaveBeenCalledWith('report-1');
  });

  it('selects an appeal and shows the empty state for an empty appeal queue', async () => {
    const appeal: ModerationAppealItem = {
      id: 'appeal-1',
      reportId: 'report-1',
      appellantId: 'user-1',
      reason: 'Please reconsider',
      createdAt: '2026-10-20T13:00:00.000Z',
      status: 'pending',
    };
    const onSelectAppeal = jest.fn();
    await renderWithProviders(
      <ReportQueue
        activeTab="appeals"
        isWideLayout={false}
        showQueue
        hasQueueItems
        statusFilter="all"
        onStatusFilterChange={jest.fn()}
        reports={[]}
        appeals={[appeal]}
        selectedReportId=""
        selectedAppealId=""
        isLoading={false}
        isError={false}
        error={undefined}
        refetch={jest.fn()}
        language={LANGUAGES.english}
        copy={copy}
        onSelectReport={jest.fn()}
        onSelectAppeal={onSelectAppeal}
      />,
    );
    await userEvent.press(screen.getByTestId('moderation-appeal-appeal-1'));

    expect(onSelectAppeal).toHaveBeenCalledWith('appeal-1', 'report-1');
  });
});
