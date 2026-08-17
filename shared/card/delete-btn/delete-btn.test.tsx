import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Platform } from 'react-native';
import { ROUTES } from '@const/enums';
import * as errorToastModule from '@S/error-toast/error-toast';
import { BASE_URL } from '@T/utils/handlers';
import { server } from '@T/utils/server';
import { CARD_DELETE_BTN, CARD_DELETE_BTN_TEST_ID } from './const';
import ActivityCardDeleteBtn from './delete-btn';
import { renderWithProviders } from '../../../tests/utils/test-utils';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));

describe('Activity card delete btn', () => {
  it('should correctly renders', async () => {
    await renderWithProviders(<ActivityCardDeleteBtn activityId="someActivityId" />);
    expect(screen.getByTestId(CARD_DELETE_BTN_TEST_ID)).toBeOnTheScreen();
  });
  it('should correctly interracts with the user', async () => {
    await renderWithProviders(<ActivityCardDeleteBtn activityId="someActivityId" />);
    const deleteBtn = screen.getByTestId(CARD_DELETE_BTN_TEST_ID);
    await userEvent.press(deleteBtn);
    expect(await screen.findByText(CARD_DELETE_BTN.russian.accept)).toBeOnTheScreen();
  });

  it('returns to the feed after deleting an activity', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    mockReplace.mockClear();
    let deletedUrl = '';
    server.use(
      http.delete(`${BASE_URL}/activity/:activityId`, ({ request }) => {
        deletedUrl = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderWithProviders(<ActivityCardDeleteBtn activityId="someActivityId" />);
    await userEvent.press(screen.getByTestId(CARD_DELETE_BTN_TEST_ID));
    await waitFor(() => expect(deletedUrl).toContain('/activity/someActivityId'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(ROUTES.root));
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('shows an error and stays on the page when deleting fails', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
    server.use(
      http.delete(`${BASE_URL}/activity/:activityId`, () =>
        HttpResponse.json({ message: 'Delete failed' }, { status: 500 }),
      ),
    );

    await renderWithProviders(<ActivityCardDeleteBtn activityId="someActivityId" />);
    await userEvent.press(screen.getByTestId(CARD_DELETE_BTN_TEST_ID));

    await waitFor(() => expect(errorToast).toHaveBeenCalled());
    expect(mockReplace).not.toHaveBeenCalledWith(ROUTES.root);
    errorToast.mockRestore();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });
});
