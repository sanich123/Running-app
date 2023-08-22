import { render, screen, userEvent, act } from '@testing-library/react-native';

import PasswordInput from './password-input';
jest.useFakeTimers();
describe('Password input', () => {
  const setPassword = jest.fn();
  const setPasswordError = jest.fn();
  const user = userEvent.setup();
  it('should correctly renders and interract with the user', async () => {
    render(
      <PasswordInput
        password="7fwd7rlm"
        setPassword={setPassword}
        setPasswordError={setPasswordError}
        passwordError={false}
      />,
    );
    const passwordInput = screen.getByDisplayValue('7fwd7rlm');
    expect(passwordInput).toBeDefined();
    expect(screen.getAllByText(/password/i)).toHaveLength(2);
    await act(async () => await user.clear(passwordInput));
    await act(async () => await user.type(passwordInput, 'Some words'));
  });
});
