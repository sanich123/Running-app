import { screen, userEvent } from '@testing-library/react-native';

import PasswordInput from './password-input';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
describe('Password input', () => {
  it('should correctly renders', () => {
    renderWithProviders(
      <PasswordInput
        password=""
        setPassword={jest.fn()}
        setPasswordError={jest.fn()}
        passwordError={false}
        isDisabled={false}
      />,
      { store: mockStore },
    );
    expect(screen.getByRole('text')).toBeOnTheScreen();
    expect(
      screen.getByText('        Password must contain one capital, one normal letter, one number, length 4-8 symbols'),
    ).toBeOnTheScreen();
  });
  it('should correctly handle typing', async () => {
    const setPasswordFn = jest.fn();
    const setPasswordError = jest.fn();
    renderWithProviders(
      <PasswordInput
        password=""
        setPassword={setPasswordFn}
        setPasswordError={setPasswordError}
        passwordError={false}
        isDisabled={false}
      />,
      { store: mockStore },
    );
    const passwordInput = screen.getByRole('text');
    await userEvent.type(passwordInput, '7FWD');
    expect(setPasswordFn).toHaveBeenCalledTimes(4);
    expect(setPasswordFn).toHaveBeenLastCalledWith('D');
  });
  it('should correctly handle email errors', async () => {
    const setPasswordFn = jest.fn();
    const setPasswordError = jest.fn();
    renderWithProviders(
      <PasswordInput
        password=""
        setPassword={setPasswordFn}
        setPasswordError={setPasswordError}
        passwordError={false}
        isDisabled={false}
      />,
      { store: mockStore },
    );
    const passwordInput = screen.getByRole('text');
    await userEvent.type(passwordInput, '7FWD');
    expect(setPasswordError).toHaveBeenCalledTimes(5);
    expect(setPasswordError).toHaveBeenCalledWith(true);
  });
  it('should correctly handle when isDisabled', () => {
    const setPasswordFn = jest.fn();
    const setPasswordError = jest.fn();
    renderWithProviders(
      <PasswordInput
        password=""
        setPassword={setPasswordFn}
        setPasswordError={setPasswordError}
        passwordError={false}
        isDisabled
      />,
      { store: mockStore },
    );
    const passwordInput = screen.getByRole('text');
    expect(passwordInput).toBeDisabled();
  });
});
