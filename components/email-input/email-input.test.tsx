import { render, screen } from '@testing-library/react-native';

import EmailInput from './email-input';

describe('Email input', () => {
  it('should correctly renders', () => {
    render(<EmailInput />);
    expect(screen.getByRole('text')).toBeOnTheScreen();
    expect(screen.getByText('Email must be valid email address')).toBeOnTheScreen();
  });
});
