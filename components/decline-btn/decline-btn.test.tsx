import { ADDITIONAL_INFO_INITIAL_STATE, FINISHED_ACTIVITY_INITIAL_STATE } from '@R/activity/const';
import { screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { DECLINE_BTN } from './const';
import DeclineBtn from './decline-btn';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.spyOn(Alert, 'alert');

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: jest.fn() }) }));

describe('Decline btn', () => {
  it('should correctly renders in english', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<DeclineBtn isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(DECLINE_BTN.english.cancel)).toBeOnTheScreen();
  });
  it('should correctly handle alert and reset activity global state, when user clicked', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<DeclineBtn isDisabled={false} />, { store: mockStore });
    const discardBtn = screen.getByText(DECLINE_BTN.english.cancel);
    await userEvent.press(discardBtn);
    expect(Alert.alert).toHaveBeenCalled();
    expect(mockStore.getState().activity.additionalInfo).toEqual(ADDITIONAL_INFO_INITIAL_STATE);
    expect(mockStore.getState().activity.finishedActivity).toEqual(FINISHED_ACTIVITY_INITIAL_STATE);
    expect(mockStore.getState().activity.manualDate).toEqual(null);
    expect(mockStore.getState().activity.manualHours).toEqual(0);
    expect(mockStore.getState().activity.manualDistance).toEqual(0);
    expect(mockStore.getState().activity.manualMinutes).toEqual(0);
  });
  it('should correctly handle isDisabled state', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<DeclineBtn isDisabled />, { store: mockStore });
    expect(screen.getByText(DECLINE_BTN.english.cancel)).toBeDisabled();
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<DeclineBtn isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(DECLINE_BTN.russian.cancel)).toBeOnTheScreen();
  });
});
