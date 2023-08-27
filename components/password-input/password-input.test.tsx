import { render, screen, act } from '@testing-library/react-native';

import PasswordInput from './password-input';
jest.useFakeTimers();
describe('Password input', () => {
  it('should correctly renders and interract with the user', () => {
    act(() => jest.runAllTimers());
    render(<PasswordInput />);
    expect(screen.getByDisplayValue('7FWD&rlm')).toBeDefined();
    expect(screen.getByRole('text')).toBeDefined();
    expect(screen.getAllByText(/password/i)).toHaveLength(4);
  });
});
