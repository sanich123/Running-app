import { screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';

import DeclineBtn from './decline-btn';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.spyOn(Alert, 'alert');

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
describe('Decline btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<DeclineBtn isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(/discard/i)).toBeOnTheScreen();
  });
  it('should correctly handle alert, when user clicked', async () => {
    renderWithProviders(<DeclineBtn isDisabled={false} />, { store: mockStore });
    const discardBtn = screen.getByText(/discard/i);
    await userEvent.press(discardBtn);
    expect(Alert.alert).toHaveBeenCalled();
  });
  it('should correctly handle isDisabled state', () => {
    renderWithProviders(<DeclineBtn isDisabled />, { store: mockStore });
    expect(screen.getByText(/discard/i)).toBeDisabled();
  });
});
