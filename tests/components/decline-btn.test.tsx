import { screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { DECLINE_BTN } from '../../components/decline-btn/const';
import DeclineBtn from '../../components/decline-btn/decline-btn';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

jest.spyOn(Alert, 'alert');

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
describe('Decline btn', () => {
  it('should correctly renders in english', () => {
    renderWithProviders(<DeclineBtn isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(DECLINE_BTN.english.cancel)).toBeOnTheScreen();
  });
  it('should correctly handle alert, when user clicked', async () => {
    renderWithProviders(<DeclineBtn isDisabled={false} />, { store: mockStore });
    const discardBtn = screen.getByText(DECLINE_BTN.english.cancel);
    await userEvent.press(discardBtn);
    expect(Alert.alert).toHaveBeenCalled();
  });
  it('should correctly handle isDisabled state', () => {
    renderWithProviders(<DeclineBtn isDisabled />, { store: mockStore });
    expect(screen.getByText(DECLINE_BTN.english.cancel)).toBeDisabled();
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<DeclineBtn isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(DECLINE_BTN.russian.cancel)).toBeOnTheScreen();
  });
});
