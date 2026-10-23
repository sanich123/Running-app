import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { USER_SAFETY_MENU_COPY } from './const';
import UserSafetyMenu from './user-safety-menu';
import { REPORT_CONTENT_COPY } from '../report-content-dialog/const';

jest.mock('@S/moderation/content-actions-menu/content-actions-menu', () => {
  const React = jest.requireActual('react');
  const { Pressable: MockPressable } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ onReport, onBlock }: { onReport: () => void; onBlock: () => void }) =>
      React.createElement(
        React.Fragment,
        null,
        React.createElement(MockPressable, { onPress: onReport, testID: 'mock-report-user' }),
        React.createElement(MockPressable, { onPress: onBlock, testID: 'mock-block-user' }),
      ),
  };
});

describe('UserSafetyMenu', () => {
  beforeEach(() => {
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
  });

  it('sends a profile report for the selected user', async () => {
    const user = userEvent.setup();
    const receivedRequests: unknown[] = [];
    server.use(
      http.post(`${BASE_URL}/moderation/reports`, async ({ request }) => {
        receivedRequests.push(await request.json());
        return HttpResponse.json({ id: 'report-id', status: 'open' }, { status: 201 });
      }),
    );

    await renderWithProviders(<UserSafetyMenu userId="reported-user" />);
    await user.press(screen.getByTestId('mock-report-user'));
    await user.press(screen.getByText(REPORT_CONTENT_COPY[LANGUAGES.russian].submit));

    await waitFor(() =>
      expect(receivedRequests).toEqual([{ targetType: 'user', targetId: 'reported-user', reason: 'harassment' }]),
    );
  });

  it('asks for confirmation before blocking the selected user', async () => {
    const user = userEvent.setup();
    const blockedUsers: string[] = [];
    server.use(
      http.put(`${BASE_URL}/moderation/blocks/:userId`, ({ params }) => {
        blockedUsers.push(String(params.userId));
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await renderWithProviders(<UserSafetyMenu userId="blocked-user" />);
    await user.press(screen.getByTestId('mock-block-user'));
    expect(screen.getByText(USER_SAFETY_MENU_COPY[LANGUAGES.russian].blockTitle)).toBeOnTheScreen();
    await user.press(screen.getByText(USER_SAFETY_MENU_COPY[LANGUAGES.russian].blockConfirm));

    await waitFor(() => expect(blockedUsers).toEqual(['blocked-user']));
  });
});
