import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, STATUSES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { resetLocationSlice, setDuration } from '@R/slices/location/location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityCloseBtn from './close-btn';
import { ACTIVITY_CLOSE_BTN } from './const';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe('Activity close btn', () => {
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
    mockStore.dispatch(resetLocationSlice());
    await renderWithProviders(<ActivityCloseBtn />, { store: mockStore });
    await userEvent.press(screen.getByText(ACTIVITY_CLOSE_BTN.english.btnText));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('returns to the previous screen after confirming an active recording close', async () => {
    mockBack.mockClear();
    mockStore.dispatch(setDuration(10000));
    await renderWithProviders(<ActivityCloseBtn />, { store: mockStore });
    await userEvent.press(screen.getByText(ACTIVITY_CLOSE_BTN.english.btnText));
    await userEvent.press(await screen.findByText(ACTIVITY_CLOSE_BTN.english.alertAccept));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
