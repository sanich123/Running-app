import { render, screen } from '@testing-library/react-native';

import PasswordInput from './password-input';
jest.useFakeTimers();
describe('Password input', () => {
  it('should correctly renders and interract with the user', async () => {
    render(<PasswordInput />);
    expect(screen.getAllByText(/password/i)).toHaveLength(2);
  });
});
