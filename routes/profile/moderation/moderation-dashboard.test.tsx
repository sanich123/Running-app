import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Linking } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { changeLanguage } from '@R/slices/settings/settings';
import { ERROR_COMPONENT_COPY, ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { MODERATION_DASHBOARD_COPY } from './const';
import ModerationDashboard from './moderation-dashboard';
import type {
  ModerationAppealItem,
  ModerationReportContext,
  ModerationReportDetails,
  ModerationReportItem,
} from '@R/services/moderation/types';

const mockRouteParams = { current: {} as { reportId?: string; appealId?: string; showAppeals?: string } };
jest.mock('expo-router', () => ({ useLocalSearchParams: () => mockRouteParams.current }));

function createReport(overrides: Partial<ModerationReportItem> = {}): ModerationReportItem {
  return {
    id: 'report-1',
    reporterId: null,
    targetType: 'activity',
    targetId: 'activity-1',
    subjectUserId: 'author-1',
    reason: 'threats',
    details: 'Threat in description',
    status: 'open',
    priority: 'normal',
    assignedModeratorId: null,
    createdAt: '2026-10-20T12:00:00.000Z',
    reviewedAt: null,
    ...overrides,
  };
}

function createReportDetails(
  report = createReport(),
  context: ModerationReportContext | null = {
    title: 'Morning run',
    description: 'Reported workout',
    moderationStatus: 'visible',
  },
): ModerationReportDetails {
  return {
    report,
    context,
    actions: [],
  };
}

describe('ModerationDashboard', () => {
  beforeEach(() => {
    mockRouteParams.current = {};
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
  });

  it('does not request the moderation queue when the account is not a moderator', async () => {
    const queueRequests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/admin/access`, () => HttpResponse.json({ roles: [], permissions: [], isSuperuser: false })),
      http.get(`${BASE_URL}/moderation/reports`, ({ request }) => {
        queueRequests.push(request.url);
        return HttpResponse.json([]);
      }),
    );

    await renderWithProviders(<ModerationDashboard />);

    expect(await screen.findByText(MODERATION_DASHBOARD_COPY[LANGUAGES.russian].noAccess)).toBeOnTheScreen();
    expect(queueRequests).toEqual([]);
  });

  it('shows the active report queue to a moderator', async () => {
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
    );

    await renderWithProviders(<ModerationDashboard />);

    expect(await screen.findByText(MODERATION_DASHBOARD_COPY[LANGUAGES.russian].title)).toBeOnTheScreen();
    expect(screen.getByText(MODERATION_DASHBOARD_COPY[LANGUAGES.russian].emptyReports)).toBeOnTheScreen();
  });

  it('reviews a report, records an internal note, and refreshes the queue after hiding content', async () => {
    const user = userEvent.setup();
    const receivedActions: unknown[] = [];
    const report = createReport();
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.russian];
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([report])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/reports/report-1`, () => HttpResponse.json(createReportDetails(report))),
      http.post(`${BASE_URL}/moderation/reports/report-1/actions`, async ({ request }) => {
        receivedActions.push(await request.json());
        return HttpResponse.json({ ...report, status: 'resolved' });
      }),
    );

    await renderWithProviders(<ModerationDashboard />);
    await user.press(await screen.findByTestId('moderation-report-report-1'));
    await user.press(await screen.findByTestId('moderation-action-hide_content'));
    await user.type(screen.getByTestId('moderation-decision-note'), 'Reviewed evidence');
    await user.press(screen.getByText(copy.confirmAction));

    await waitFor(() => expect(receivedActions).toEqual([{ action: 'hide_content', note: 'Reviewed evidence' }]));
  });

  it('loads an appeal from the email link and lets the moderator uphold it', async () => {
    const user = userEvent.setup();
    const receivedDecisions: unknown[] = [];
    const report = createReport({ status: 'resolved' });
    const appeal: ModerationAppealItem = {
      id: 'appeal-1',
      reportId: report.id,
      appellantId: 'author-1',
      reason: 'This workout description was misunderstood.',
      createdAt: '2026-10-20T13:00:00.000Z',
      status: 'pending',
    };
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.russian];
    mockRouteParams.current = { showAppeals: 'true', appealId: appeal.id };
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([report])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([appeal])),
      http.get(`${BASE_URL}/moderation/reports/report-1`, () => HttpResponse.json(createReportDetails(report))),
      http.post(`${BASE_URL}/moderation/appeals/appeal-1/decision`, async ({ request }) => {
        receivedDecisions.push(await request.json());
        return HttpResponse.json({ ...appeal, status: 'upheld' });
      }),
    );

    await renderWithProviders(<ModerationDashboard />);
    await user.press(await screen.findByTestId('moderation-appeal-appeal-1'));
    await user.press(await screen.findByText(copy.upholdAppeal));
    await user.press(screen.getByText(copy.confirmAction));

    await waitFor(() => expect(receivedDecisions).toEqual([{ decision: 'upheld' }]));
  });

  it('filters reports by status without hiding the open report', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () =>
        HttpResponse.json([
          createReport(),
          createReport({ id: 'report-2', targetId: 'activity-2', status: 'in_review' }),
        ]),
      ),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
    );

    await renderWithProviders(<ModerationDashboard />);
    expect(await screen.findByTestId('moderation-report-report-1')).toBeOnTheScreen();
    expect(screen.getByTestId('moderation-report-report-2')).toBeOnTheScreen();
    await user.press(screen.getByTestId('moderation-report-filter-open'));
    expect(screen.getByTestId('moderation-report-report-1')).toBeOnTheScreen();
    expect(screen.queryByTestId('moderation-report-report-2')).toBeNull();
  });

  it('shows sampled video frames and lets the moderator approve a reviewed upload', async () => {
    const user = userEvent.setup();
    const receivedActions: unknown[] = [];
    const report = createReport({ targetType: 'media_upload', targetId: 'asset-1', reason: 'sexual_content' });
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.russian];
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([report])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/reports/report-1`, () =>
        HttpResponse.json(
          createReportDetails(report, {
            url: 'https://cdn.example/video.mp4',
            thumbnail: 'https://cdn.example/video-preview.jpg',
            moderationStatus: 'review_required',
            contentType: 'video/mp4',
            scores: { Porn: 0.93 },
            frameCount: 18,
          }),
        ),
      ),
      http.post(`${BASE_URL}/moderation/reports/report-1/actions`, async ({ request }) => {
        receivedActions.push(await request.json());
        return HttpResponse.json({ ...report, status: 'resolved' });
      }),
    );

    await renderWithProviders(<ModerationDashboard />);
    await user.press(await screen.findByTestId('moderation-report-report-1'));

    expect(await screen.findByText(`${copy.framesChecked}: 18`)).toBeOnTheScreen();
    expect(screen.getByText(/Porn 93.0%/)).toBeOnTheScreen();
    expect(screen.getByText(`${copy.mediaCheckStatus}: ${copy.mediaStatus.review_required}`)).toBeOnTheScreen();
    await user.press(screen.getByTestId('moderation-action-approve_media'));
    await user.press(screen.getByText(copy.confirmAction));

    await waitFor(() => expect(receivedActions).toEqual([{ action: 'approve_media' }]));
  });

  it('confirms the selected suspension length for a reported profile', async () => {
    const user = userEvent.setup();
    const receivedActions: unknown[] = [];
    const report = createReport({ targetType: 'user', targetId: 'author-1', reason: 'harassment' });
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.english];
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([report])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/reports/report-1`, () =>
        HttpResponse.json(
          createReportDetails(report, {
            name: 'Alex',
            surname: 'Runner',
            moderationStatus: 'visible',
          }),
        ),
      ),
      http.post(`${BASE_URL}/moderation/reports/report-1/actions`, async ({ request }) => {
        receivedActions.push(await request.json());
        return HttpResponse.json({ ...report, status: 'resolved' });
      }),
    );

    await renderWithProviders(<ModerationDashboard />);
    await user.press(await screen.findByTestId('moderation-report-report-1'));
    expect(await screen.findByText('Alex Runner')).toBeOnTheScreen();
    expect(screen.queryByTestId('moderation-action-hide_content')).toBeNull();
    await user.press(screen.getByTestId('moderation-action-temporary_suspend'));
    const suspensionInput = screen.getByTestId('moderation-suspension-days');
    await user.clear(suspensionInput);
    await user.type(suspensionInput, '14');
    await user.press(screen.getByText(copy.confirmAction));

    await waitFor(() => expect(receivedActions).toEqual([{ action: 'temporary_suspend', suspensionDays: 14 }]));
  });

  it('uses the default suspension period when the moderator leaves the duration empty', async () => {
    const user = userEvent.setup();
    const receivedActions: unknown[] = [];
    const report = createReport({ targetType: 'user', targetId: 'author-1', reason: 'harassment' });
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.russian];
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([report])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/reports/report-1`, () => HttpResponse.json(createReportDetails(report))),
      http.post(`${BASE_URL}/moderation/reports/report-1/actions`, async ({ request }) => {
        receivedActions.push(await request.json());
        return HttpResponse.json({ ...report, status: 'resolved' });
      }),
    );

    await renderWithProviders(<ModerationDashboard />);
    await user.press(await screen.findByTestId('moderation-report-report-1'));
    await user.press(await screen.findByTestId('moderation-action-temporary_suspend'));
    await user.clear(screen.getByTestId('moderation-suspension-days'));
    await user.press(screen.getByText(copy.confirmAction));

    await waitFor(() => expect(receivedActions).toEqual([{ action: 'temporary_suspend', suspensionDays: 7 }]));
  });

  it('opens a report from its email link when the target has no available context', async () => {
    const report = createReport({ id: 'closed-report', status: 'rejected', details: '' });
    mockRouteParams.current = { reportId: report.id };
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/reports/closed-report`, () =>
        HttpResponse.json(createReportDetails(report, null)),
      ),
    );

    await renderWithProviders(<ModerationDashboard />);

    expect(
      await screen.findByText(
        `${MODERATION_DASHBOARD_COPY[LANGUAGES.russian].targetType.activity} · ${MODERATION_DASHBOARD_COPY[LANGUAGES.russian].status.rejected}`,
      ),
    ).toBeOnTheScreen();
    expect(screen.queryByText(MODERATION_DASHBOARD_COPY[LANGUAGES.russian].noHistory)).toBeOnTheScreen();
    expect(screen.queryByTestId('moderation-action-hide_content')).toBeNull();
  });

  it('shows a hidden media target and its action history, and opens the media link', async () => {
    const user = userEvent.setup();
    const report = createReport({ targetType: 'media', targetId: 'media-1' });
    const details = createReportDetails(report, {
      url: 'https://cdn.example/photo.jpg',
      moderationStatus: 'hidden',
    });
    details.actions = [
      {
        id: 'action-1',
        reportId: report.id,
        actorId: 'moderator-1',
        action: 'warn_user',
        note: null,
        createdAt: '2026-10-20T13:00:00.000Z',
      },
    ];
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([report])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/reports/report-1`, () => HttpResponse.json(details)),
    );

    await renderWithProviders(<ModerationDashboard />);
    await user.press(await screen.findByTestId('moderation-report-report-1'));

    expect(await screen.findByTestId('moderation-open-media')).toBeOnTheScreen();
    expect(screen.getByTestId('moderation-action-restore_content')).toBeOnTheScreen();
    expect(screen.getByText(MODERATION_DASHBOARD_COPY[LANGUAGES.russian].history)).toBeOnTheScreen();
    await user.press(screen.getByTestId('moderation-open-media'));
    await waitFor(() => expect(openUrl).toHaveBeenCalledWith('https://cdn.example/photo.jpg'));
  });

  it('shows activity media previews when reviewing an activity report', async () => {
    const user = userEvent.setup();
    const report = createReport({ targetType: 'activity', targetId: 'activity-1' });
    const details = createReportDetails(report, {
      title: 'Morning run',
      media: [
        { id: 'activity-media-1', url: 'https://cdn.example/video.mp4', thumbnail: 'https://cdn.example/video.jpg' },
      ],
    });
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([report])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/reports/report-1`, () => HttpResponse.json(details)),
    );

    await renderWithProviders(<ModerationDashboard />);
    await user.press(await screen.findByTestId('moderation-report-report-1'));

    expect(await screen.findByTestId('moderation-activity-media-list')).toBeOnTheScreen();
    expect(screen.getByTestId('moderation-activity-media-preview-activity-media-1').props.source).toEqual({
      uri: 'https://cdn.example/video.jpg',
    });
    await user.press(screen.getByTestId('moderation-activity-media-activity-media-1'));
    await waitFor(() => expect(openUrl).toHaveBeenCalledWith('https://cdn.example/video.mp4'));
  });

  it('keeps the decision dialog open when applying a moderation action fails', async () => {
    const user = userEvent.setup();
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.russian];
    const report = createReport();
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([report])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/reports/report-1`, () => HttpResponse.json(createReportDetails(report))),
      http.post(`${BASE_URL}/moderation/reports/report-1/actions`, () =>
        HttpResponse.json({ message: 'failed' }, { status: 500 }),
      ),
    );

    await renderWithProviders(<ModerationDashboard />);
    await user.press(await screen.findByTestId('moderation-report-report-1'));
    await user.press(await screen.findByTestId('moderation-action-hide_content'));
    await user.press(screen.getByText(copy.confirmAction));

    await waitFor(() => expect(screen.getByText(copy.confirm)).toBeOnTheScreen());
  });

  it('keeps the appeal decision dialog open when submitting an appeal decision fails', async () => {
    const user = userEvent.setup();
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.russian];
    const report = createReport({ status: 'resolved' });
    const appeal: ModerationAppealItem = {
      id: 'appeal-failing',
      reportId: report.id,
      appellantId: 'author-1',
      reason: 'Please review this decision again.',
      createdAt: '2026-10-20T13:00:00.000Z',
      status: 'pending',
    };
    mockRouteParams.current = { showAppeals: 'true' };
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([report])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([appeal])),
      http.get(`${BASE_URL}/moderation/reports/report-1`, () => HttpResponse.json(createReportDetails(report))),
      http.post(`${BASE_URL}/moderation/appeals/appeal-failing/decision`, () =>
        HttpResponse.json({ message: 'failed' }, { status: 500 }),
      ),
    );

    await renderWithProviders(<ModerationDashboard />);
    await user.press(await screen.findByTestId('moderation-appeal-appeal-failing'));
    await user.press(await screen.findByText(copy.rejectAppeal));
    await user.press(screen.getByText(copy.confirmAction));

    await waitFor(() => expect(screen.getByText(copy.confirm)).toBeOnTheScreen());
  });

  it('shows a retry action when the report queue fails to load', async () => {
    const user = userEvent.setup();
    let reportRequests = 0;
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.russian];
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => {
        reportRequests += 1;
        return reportRequests === 1
          ? HttpResponse.json({ message: 'temporary failure' }, { status: 500 })
          : HttpResponse.json([]);
      }),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
    );

    await renderWithProviders(<ModerationDashboard />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
    await user.press(screen.getByText(ERROR_COMPONENT_COPY[LANGUAGES.russian].retry));

    expect(await screen.findByText(copy.emptyReports)).toBeOnTheScreen();
    expect(reportRequests).toBe(2);
  });

  it('shows and retries an appeal queue error from the appeals tab', async () => {
    const user = userEvent.setup();
    let appealRequests = 0;
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.russian];
    mockRouteParams.current = { showAppeals: 'true' };
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/appeals`, () => {
        appealRequests += 1;
        return appealRequests === 1
          ? HttpResponse.json({ message: 'temporary failure' }, { status: 500 })
          : HttpResponse.json([]);
      }),
    );

    await renderWithProviders(<ModerationDashboard />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
    await user.press(screen.getByText(ERROR_COMPONENT_COPY[LANGUAGES.russian].retry));

    expect(await screen.findByText(copy.emptyAppeals)).toBeOnTheScreen();
    expect(appealRequests).toBe(2);
  });

  it('shows an error when the selected report details cannot be loaded', async () => {
    const report = createReport();
    mockRouteParams.current = { reportId: report.id };
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([report])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/reports/report-1`, () =>
        HttpResponse.json({ message: 'temporary failure' }, { status: 500 }),
      ),
    );

    await renderWithProviders(<ModerationDashboard />);

    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });

  it('keeps the details pane empty when a selected report response has no report', async () => {
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.russian];
    mockRouteParams.current = { reportId: 'missing-report' };
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/reports/missing-report`, () =>
        HttpResponse.json({ report: null, context: null, actions: [] }),
      ),
    );

    await renderWithProviders(<ModerationDashboard />);

    expect(await screen.findByText(copy.title)).toBeOnTheScreen();
    expect(screen.queryByText(copy.context)).toBeNull();
    expect(screen.queryByTestId(ERROR_COMPONENT_TEST_ID)).toBeNull();
  });

  it('shows the responsive English moderation layout on a wide screen', async () => {
    const report = createReport();
    const dimensions = jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({
      width: 1200,
      height: 900,
      scale: 1,
      fontScale: 1,
    });
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.english];
    server.use(
      http.get(`${BASE_URL}/admin/access`, () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
      http.get(`${BASE_URL}/moderation/reports`, () => HttpResponse.json([report])),
      http.get(`${BASE_URL}/moderation/appeals`, () => HttpResponse.json([])),
      http.get(`${BASE_URL}/moderation/reports/report-1`, () => HttpResponse.json(createReportDetails(report))),
    );

    try {
      const user = userEvent.setup();
      await renderWithProviders(<ModerationDashboard />);
      const reportRow = await screen.findByTestId('moderation-report-report-1');
      expect(
        await screen.findByText(`${copy.status.open} · ${new Date(report.createdAt).toLocaleString('en-US')}`),
      ).toBeOnTheScreen();
      await user.press(reportRow);

      expect(await screen.findByText(`${copy.targetType.activity} · ${copy.status.open}`)).toBeOnTheScreen();
      expect(screen.queryByText(copy.back)).toBeNull();
    } finally {
      dimensions.mockRestore();
    }
  });
});
