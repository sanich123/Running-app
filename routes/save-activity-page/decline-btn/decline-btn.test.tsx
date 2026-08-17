import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { FINISHED_ACTIVITY_INITIAL_STATE } from '@R/slices/activity/const';
import { ADDITIONAL_INFO_INITIAL_STATE } from '@R/slices/activity-additional-info/const';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { DECLINE_BTN } from './const';
import DeclineBtn from './decline-btn';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));

describe('Decline btn', () => {
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<DeclineBtn isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(DECLINE_BTN.english.cancel)).toBeOnTheScreen();
  });
  it('should correctly handle alert and reset activity global state, when user clicked', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<DeclineBtn isDisabled={false} />, { store: mockStore });
    const discardBtn = screen.getByText(DECLINE_BTN.english.cancel);
    await userEvent.press(discardBtn);
    const confirmBtn = await screen.findByText(DECLINE_BTN.english.accept);
    await userEvent.press(confirmBtn);
    expect(mockStore.getState().additionalInfoActivity).toEqual(ADDITIONAL_INFO_INITIAL_STATE);
    expect(mockStore.getState().activity.finishedActivity).toEqual(FINISHED_ACTIVITY_INITIAL_STATE);
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
  });
  it('should correctly handle isDisabled state', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<DeclineBtn isDisabled />, { store: mockStore });
    expect(screen.getByText(DECLINE_BTN.english.cancel)).toBeDisabled();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<DeclineBtn isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(DECLINE_BTN.russian.cancel)).toBeOnTheScreen();
  });
});
