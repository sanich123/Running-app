import { render, screen, userEvent, act } from '@testing-library/react-native';

import EmailInput from './email-input';
jest.useFakeTimers();
describe('Email input', () => {
  const setEmail = jest.fn();
  const setEmailError = jest.fn();
  const user = userEvent.setup();
  it('should correctly renders and interract with the user', async () => {
    render(
      <EmailInput email="someemail@gmail.com" setEmail={setEmail} setEmailError={setEmailError} emailError={false} />,
    );
    act(() => {
      jest.runAllTimers();
    });
    const textInput = screen.getByDisplayValue('someemail@gmail.com');
    expect(textInput).toBeDefined();
    expect(screen.getAllByText(/email/i)).toHaveLength(2);
    await act(async () => await user.clear(textInput));
    await act(async () => await user.type(textInput, 'Some words'));
  });
});
