import { render, screen } from '@testing-library/react-native';

import Login from './login';

jest.useFakeTimers();
describe('Login page', () => {
  it('should correctly renders', () => {
    render(<Login />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByText('Login')).toBeDefined();
  });
});
