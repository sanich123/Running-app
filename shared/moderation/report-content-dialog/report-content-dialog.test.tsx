import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { REPORT_CONTENT_COPY } from './const';
import ReportContentDialog from './report-content-dialog';

describe('ReportContentDialog', () => {
  beforeEach(() => mockStore.dispatch(changeLanguage(LANGUAGES.russian)));

  it('submits the selected reason and optional details for the target content', async () => {
    const user = userEvent.setup();
    const receivedRequests: unknown[] = [];
    server.use(
      http.post(`${BASE_URL}/moderation/reports`, async ({ request }) => {
        receivedRequests.push(await request.json());
        return HttpResponse.json({ id: 'report-id', status: 'open' }, { status: 201 });
      }),
    );

    await renderWithProviders(
      <ReportContentDialog visible targetType="comment" targetId="comment-id" onDismiss={jest.fn()} />,
    );

    await user.press(screen.getByText(REPORT_CONTENT_COPY[LANGUAGES.russian].reasons.threats));
    await user.type(screen.getByTestId('report-content-details'), 'Личная угроза');
    await user.press(screen.getByText(REPORT_CONTENT_COPY[LANGUAGES.russian].submit));

    await waitFor(() =>
      expect(receivedRequests).toEqual([
        { targetType: 'comment', targetId: 'comment-id', reason: 'threats', details: 'Личная угроза' },
      ]),
    );
  });

  it('dismisses and resets when the user cancels', async () => {
    const user = userEvent.setup();
    const onDismiss = jest.fn();
    await renderWithProviders(
      <ReportContentDialog visible targetType="activity" targetId="activity-id" onDismiss={onDismiss} />,
    );

    await user.press(screen.getByText(REPORT_CONTENT_COPY[LANGUAGES.russian].cancel));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('submits a changed reason and omits blank optional details', async () => {
    const user = userEvent.setup();
    const receivedRequests: unknown[] = [];
    server.use(
      http.post(`${BASE_URL}/moderation/reports`, async ({ request }) => {
        receivedRequests.push(await request.json());
        return HttpResponse.json({ id: 'report-id', status: 'open' }, { status: 201 });
      }),
    );

    await renderWithProviders(
      <ReportContentDialog visible targetType="media" targetId="media-id" onDismiss={jest.fn()} />,
    );

    await user.press(screen.getByText(REPORT_CONTENT_COPY[LANGUAGES.russian].reasons.spam));
    await user.press(screen.getByText(REPORT_CONTENT_COPY[LANGUAGES.russian].submit));

    await waitFor(() =>
      expect(receivedRequests).toEqual([{ targetType: 'media', targetId: 'media-id', reason: 'spam' }]),
    );
  });

  it('keeps the report dialog open when the report request fails', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${BASE_URL}/moderation/reports`, () =>
        HttpResponse.json({ message: 'temporary failure' }, { status: 500 }),
      ),
    );

    await renderWithProviders(
      <ReportContentDialog visible targetType="activity" targetId="activity-id" onDismiss={jest.fn()} />,
    );
    await user.press(screen.getByText(REPORT_CONTENT_COPY[LANGUAGES.russian].submit));

    expect(await screen.findByText(REPORT_CONTENT_COPY[LANGUAGES.russian].title)).toBeOnTheScreen();
  });
});
