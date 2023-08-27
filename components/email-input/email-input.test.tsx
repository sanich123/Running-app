import { render, screen, userEvent, act } from '@testing-library/react-native';

import EmailInput from './email-input';
jest.useFakeTimers();
describe('Email input', () => {
  const user = userEvent.setup();
  it('should correctly renders and interract with the user', async () => {
    render(<EmailInput />);
    act(() => jest.runAllTimers());
    const textInput = screen.getByDisplayValue('aovoronin.piano@gmail.com');
    expect(textInput).toBeDefined();
    expect(screen.getAllByText(/email/i)).toHaveLength(4);
    await act(async () => await user.clear(textInput));
    await act(async () => await user.type(textInput, 'Some words'));
  });
});
