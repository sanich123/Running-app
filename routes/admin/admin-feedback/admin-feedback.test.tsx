import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { changeLanguage } from '@R/slices/settings/settings';
import { ERROR_COMPONENT_COPY } from '@S/error-component/const';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import AdminFeedback from './admin-feedback';
import { ADMIN_FEEDBACK_COPY } from './const';

const mockRouteParams = { current: {} };
jest.mock('expo-router', () => ({ useLocalSearchParams: () => mockRouteParams.current }));

describe('AdminFeedback', () => {
  beforeEach(() => {
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setMockUserId('admin-1'));
    mockRouteParams.current = {};
  });

  it('opens a request, sends a reply, and updates its status', async () => {
    const user = userEvent.setup();
    const copy = ADMIN_FEEDBACK_COPY[LANGUAGES.english];
    const supportRequest = {
      id: 'feedback-1',
      email: 'athlete@example.test',
      kind: 'bug',
      topic: 'maps',
      text: 'The route map is blank.',
      deviceInfo: 'iPhone, iOS',
      attachments: [],
      status: 'open',
      createdAt: '2026-11-16T10:00:00.000Z',
      updatedAt: '2026-11-16T10:00:00.000Z',
      replies: [],
    };
    const replies: {
      id: string;
      text: string;
      adminEmail: string;
      deliveryStatus: 'sent';
      createdAt: string;
    }[] = [];
    const updatedStatuses: string[] = [];

    server.use(
      http.get(BASE_URL + '/admin/feedback', () => HttpResponse.json([supportRequest])),
      http.get(BASE_URL + '/admin/feedback/:id', () => HttpResponse.json({ ...supportRequest, replies })),
      http.post(BASE_URL + '/admin/feedback/:id/reply', async ({ request }) => {
        const body = (await request.json()) as { text: string };
        replies.push({
          id: 'reply-1',
          text: body.text,
          adminEmail: 'admin@example.test',
          deliveryStatus: 'sent',
          createdAt: '2026-11-16T10:01:00.000Z',
        });
        return HttpResponse.json({ ...supportRequest, status: 'in_progress', replies });
      }),
      http.patch(BASE_URL + '/admin/feedback/:id/status', async ({ request }) => {
        const body = (await request.json()) as { status: string };
        updatedStatuses.push(body.status);
        return HttpResponse.json({ ...supportRequest, status: body.status, replies });
      }),
    );

    await renderWithProviders(<AdminFeedback />);
    await user.press(await screen.findByTestId('admin-feedback-request-feedback-1'));

    expect(await screen.findByText(supportRequest.text)).toBeOnTheScreen();
    expect(screen.getByText(copy.topic + ': ' + copy.topics.maps)).toBeOnTheScreen();
    await user.type(screen.getByTestId('text-input-outlined'), 'Thanks for reporting this.');
    await user.press(screen.getByText(copy.sendReply));

    expect(await screen.findByText('Thanks for reporting this.')).toBeOnTheScreen();
    await user.press(screen.getByText(copy.resolve));
    await waitFor(() => expect(updatedStatuses).toEqual(['resolved']));
  });

  it('opens a linked resolved request with attachments and reply history', async () => {
    const copy = ADMIN_FEEDBACK_COPY[LANGUAGES.english];
    const supportRequest = {
      id: 'feedback-2',
      email: 'athlete@example.test',
      kind: 'feature',
      topic: null,
      text: 'Please add route notes.',
      deviceInfo: 'Android',
      attachments: [{ url: 'https://cdn.example/feedback/photo.webp', thumbnail: null }],
      status: 'resolved',
      createdAt: '2026-11-16T10:00:00.000Z',
      updatedAt: '2026-11-16T10:02:00.000Z',
      replies: [
        {
          id: 'reply-2',
          text: 'We added this to the roadmap.',
          adminEmail: 'admin@example.test',
          deliveryStatus: 'sent',
          createdAt: '2026-11-16T10:01:00.000Z',
        },
      ],
    };
    mockRouteParams.current = { feedbackId: 'feedback-2' };
    server.use(
      http.get(BASE_URL + '/admin/feedback', () => HttpResponse.json([])),
      http.get(BASE_URL + '/admin/feedback/:id', () => HttpResponse.json(supportRequest)),
    );

    await renderWithProviders(<AdminFeedback />);

    expect(await screen.findByText(supportRequest.text)).toBeOnTheScreen();
    expect(screen.getByText(copy.start)).toBeOnTheScreen();
    expect(screen.getByText(copy.reopen)).toBeOnTheScreen();
    expect(screen.getByText(copy.replyDelivered)).toBeOnTheScreen();
    expect(screen.getByText(supportRequest.replies[0].text)).toBeOnTheScreen();
    expect(screen.getByText(copy.attachments + ' 1')).toBeOnTheScreen();
  });

  it('shows the retry state when the request list cannot be loaded', async () => {
    server.use(
      http.get(BASE_URL + '/admin/feedback', () => HttpResponse.json({ message: 'Unavailable' }, { status: 503 })),
    );

    await renderWithProviders(<AdminFeedback />);

    expect(await screen.findByText(ERROR_COMPONENT_COPY[LANGUAGES.english].retry)).toBeOnTheScreen();
  });

  it('filters the queue and shows an empty state', async () => {
    const user = userEvent.setup();
    const requestedStatuses: string[] = [];
    server.use(
      http.get(BASE_URL + '/admin/feedback', ({ request }) => {
        requestedStatuses.push(new URL(request.url).searchParams.get('status') ?? '');
        return HttpResponse.json([]);
      }),
    );

    await renderWithProviders(<AdminFeedback />);
    expect(await screen.findByText(ADMIN_FEEDBACK_COPY[LANGUAGES.english].empty)).toBeOnTheScreen();
    await user.press(screen.getByTestId('admin-feedback-status-resolved'));

    await waitFor(() => expect(requestedStatuses).toContain('resolved'));
  });

  it('shows the in-progress actions and reply delivery states for a linked request', async () => {
    const copy = ADMIN_FEEDBACK_COPY[LANGUAGES.english];
    const supportRequest = {
      id: 'feedback-in-progress',
      email: 'athlete@example.test',
      kind: 'question',
      topic: null,
      text: 'Can I update my profile?',
      deviceInfo: 'Android',
      attachments: [],
      status: 'in_progress',
      createdAt: '2026-11-16T10:00:00.000Z',
      updatedAt: '2026-11-16T10:02:00.000Z',
      replies: [
        {
          id: 'reply-failed',
          text: 'The first response failed.',
          adminEmail: 'admin@example.test',
          deliveryStatus: 'failed',
          createdAt: '2026-11-16T10:01:00.000Z',
        },
        {
          id: 'reply-pending',
          text: 'A second response is queued.',
          adminEmail: 'admin@example.test',
          deliveryStatus: 'pending',
          createdAt: '2026-11-16T10:02:00.000Z',
        },
      ],
    };
    mockRouteParams.current = { feedbackId: supportRequest.id };
    server.use(
      http.get(BASE_URL + '/admin/feedback', () => HttpResponse.json([])),
      http.get(BASE_URL + '/admin/feedback/:id', () => HttpResponse.json(supportRequest)),
    );

    await renderWithProviders(<AdminFeedback />);

    expect(await screen.findByText(supportRequest.text)).toBeOnTheScreen();
    expect(screen.queryByText(copy.start)).not.toBeOnTheScreen();
    expect(screen.getByText(copy.resolve)).toBeOnTheScreen();
    expect(screen.getByText(copy.reopen)).toBeOnTheScreen();
    expect(screen.getByText(copy.replyFailed)).toBeOnTheScreen();
    expect(screen.getByText(copy.replyPending)).toBeOnTheScreen();
  });

  it('shows the retry state when a linked request cannot be loaded', async () => {
    mockRouteParams.current = { feedbackId: 'missing-feedback' };
    server.use(
      http.get(BASE_URL + '/admin/feedback', () => HttpResponse.json([])),
      http.get(BASE_URL + '/admin/feedback/:id', () => HttpResponse.json({ message: 'Unavailable' }, { status: 503 })),
    );

    await renderWithProviders(<AdminFeedback />);

    expect(await screen.findByText(ERROR_COMPONENT_COPY[LANGUAGES.english].retry)).toBeOnTheScreen();
  });

  it('keeps the reply draft when reply delivery fails and reports a failed status update', async () => {
    const user = userEvent.setup();
    const supportRequest = {
      id: 'feedback-3',
      email: 'athlete@example.test',
      kind: 'question',
      topic: 'account',
      text: 'How do I change my email?',
      deviceInfo: 'Android',
      attachments: [],
      status: 'open',
      createdAt: '2026-11-16T10:00:00.000Z',
      updatedAt: '2026-11-16T10:00:00.000Z',
      replies: [],
    };
    const attemptedStatuses: string[] = [];
    server.use(
      http.get(BASE_URL + '/admin/feedback', () => HttpResponse.json([supportRequest])),
      http.get(BASE_URL + '/admin/feedback/:id', () => HttpResponse.json(supportRequest)),
      http.post(BASE_URL + '/admin/feedback/:id/reply', () =>
        HttpResponse.json({ message: 'Unavailable' }, { status: 503 }),
      ),
      http.patch(BASE_URL + '/admin/feedback/:id/status', async ({ request }) => {
        const body = (await request.json()) as { status: string };
        attemptedStatuses.push(body.status);
        return HttpResponse.json({ message: 'Unavailable' }, { status: 503 });
      }),
    );

    await renderWithProviders(<AdminFeedback />);
    await user.press(await screen.findByTestId('admin-feedback-request-feedback-3'));
    await user.type(screen.getByTestId('text-input-outlined'), 'Please help.');
    await user.press(screen.getByText(ADMIN_FEEDBACK_COPY[LANGUAGES.english].sendReply));
    await waitFor(() => expect(screen.getByTestId('text-input-outlined').props.value).toBe('Please help.'));

    await user.press(screen.getByText(ADMIN_FEEDBACK_COPY[LANGUAGES.english].resolve));
    await waitFor(() => expect(attemptedStatuses).toEqual(['resolved']));
  });
});
