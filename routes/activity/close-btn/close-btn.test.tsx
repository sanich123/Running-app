import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES, STATUSES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { resetLocationSlice, setDuration } from '@R/slices/location/location';
import * as errorToastModule from '@S/error-toast/error-toast';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import * as backgroundLocation from '@U/location/expo-task-manager/background-location';
import ActivityCloseBtn from './close-btn';
import { ACTIVITY_CLOSE_BTN } from './const';

const mockBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    canGoBack: mockCanGoBack,
    replace: mockReplace,
  }),
}));

describe('Activity close btn', () => {
  beforeEach(() => {
    mockStore.dispatch(resetLocationSlice());
    jest.restoreAllMocks();
    mockCanGoBack.mockReturnValue(true);
  });

  it('should correctly renders in english', async () => {
    await renderWithProviders(<ActivityCloseBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_CLOSE_BTN.russian.btnText)).toBeDefined();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<ActivityCloseBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_CLOSE_BTN.russian.btnText)).toBeDefined();
  });
  it('should correctly show alert message, when duration is greater than 0', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setDuration(10000));
    await renderWithProviders(<ActivityCloseBtn />, { store: mockStore });
    const closeBtn = screen.getByText(ACTIVITY_CLOSE_BTN.english.btnText);
    await userEvent.press(closeBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.paused);
    expect(await screen.findByText(ACTIVITY_CLOSE_BTN.english.alertAccept)).toBeOnTheScreen();
  });

  it('returns to the previous screen when there is no recorded activity', async () => {
    mockBack.mockClear();
    mockCanGoBack.mockReturnValue(true);
    mockStore.dispatch(resetLocationSlice());
    await renderWithProviders(<ActivityCloseBtn />, { store: mockStore });
    await userEvent.press(screen.getByText(ACTIVITY_CLOSE_BTN.english.btnText));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('returns to the previous screen after confirming an active recording close', async () => {
    mockBack.mockClear();
    mockCanGoBack.mockReturnValue(true);
    mockStore.dispatch(setDuration(10000));
    await renderWithProviders(<ActivityCloseBtn />, { store: mockStore });
    await userEvent.press(screen.getByText(ACTIVITY_CLOSE_BTN.english.btnText));
    await userEvent.press(await screen.findByText(ACTIVITY_CLOSE_BTN.english.alertAccept));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('redirects to the activities feed when there is no navigation history', async () => {
    mockCanGoBack.mockReturnValue(false);
    mockBack.mockClear();
    mockReplace.mockClear();
    mockStore.dispatch(resetLocationSlice());
    await renderWithProviders(<ActivityCloseBtn />, { store: mockStore });

    await userEvent.press(screen.getByText(ACTIVITY_CLOSE_BTN.english.btnText));

    expect(mockReplace).toHaveBeenCalledWith('/');
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('shows loading and blocks duplicate close requests until tracking stops', async () => {
    let resolveStop!: () => void;
    const stopPromise = new Promise<void>((resolve) => {
      resolveStop = resolve;
    });
    const stopSpy = jest.spyOn(backgroundLocation, 'stopLocationTracking').mockReturnValue(stopPromise);
    await renderWithProviders(<ActivityCloseBtn />);
    const closeButton = screen.getByText(ACTIVITY_CLOSE_BTN.english.btnText);

    await userEvent.press(closeButton);
    await userEvent.press(closeButton);
    expect(stopSpy).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();

    resolveStop();
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });

  it('reports a stop error and leaves navigation untouched', async () => {
    const error = new Error('stop failed');
    jest.spyOn(backgroundLocation, 'stopLocationTracking').mockRejectedValue(error);
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
    await renderWithProviders(<ActivityCloseBtn />);
    await userEvent.press(screen.getByText(ACTIVITY_CLOSE_BTN.english.btnText));

    await waitFor(() =>
      expect(errorToast).toHaveBeenCalledWith('Не удалось остановить отслеживание геопозиции', error),
    );
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockStore.getState().location.activityStatus).toBe(STATUSES.initial);
  });
});
