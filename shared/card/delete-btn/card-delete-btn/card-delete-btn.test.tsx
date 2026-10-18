import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Platform } from 'react-native';
import * as errorToastModule from '@S/error-toast/error-toast';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { CARD_DELETE_BTN, CARD_DELETE_BTN_TEST_ID } from '../const';
import ActivityCardDeleteBtn from './card-delete-btn';
import { renderWithProviders } from '../../../../tests/utils/test-utils';
import { ActivityCardContext } from '../../context';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack }) }));

function renderDeleteBtn() {
  mockStore.dispatch(setMockUserId('activity-owner'));

  return renderWithProviders(
    <ActivityCardContext.Provider
      value={{
        activity: {
          date: '2026-08-09T10:00:00.000Z',
          sport: 'run',
          id: 'someActivityId',
          userId: 'activity-owner',
          duration: 0,
          distance: 0,
          elevationGain: 0,
          profile: MOCK_PROFILE,
          commentsLength: 0,
        },
        isFullView: false,
        isShowDeleteBtn: true,
        isShowDescription: false,
      }}>
      <ActivityCardDeleteBtn />
    </ActivityCardContext.Provider>,
  );
}

describe('Activity card delete btn', () => {
  it('should correctly renders', async () => {
    await renderDeleteBtn();
    expect(screen.getByTestId(CARD_DELETE_BTN_TEST_ID)).toBeOnTheScreen();
  });
  it('should correctly interracts with the user', async () => {
    await renderDeleteBtn();
    const deleteBtn = screen.getByTestId(CARD_DELETE_BTN_TEST_ID);
    await userEvent.press(deleteBtn);
    expect(await screen.findByText(CARD_DELETE_BTN.russian.accept)).toBeOnTheScreen();
  });

  it('returns to the previous page after deleting an activity', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    mockBack.mockClear();
    let deletedUrl = '';
    server.use(
      http.delete(`${BASE_URL}/activity/:activityId`, ({ request }) => {
        deletedUrl = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderDeleteBtn();
    await userEvent.press(screen.getByTestId(CARD_DELETE_BTN_TEST_ID));
    await waitFor(() => expect(deletedUrl).toContain('/activity/someActivityId'));
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('shows an error and stays on the page when deleting fails', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    mockBack.mockClear();
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
    server.use(
      http.delete(`${BASE_URL}/activity/:activityId`, () =>
        HttpResponse.json({ message: 'Delete failed' }, { status: 500 }),
      ),
    );

    await renderDeleteBtn();
    await userEvent.press(screen.getByTestId(CARD_DELETE_BTN_TEST_ID));

    await waitFor(() => expect(errorToast).toHaveBeenCalled());
    expect(mockBack).not.toHaveBeenCalled();
    errorToast.mockRestore();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });
});
