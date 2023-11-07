import { render, screen } from '@testing-library/react-native';

import ErrorComponent from './error-component';

describe('Error component', () => {
  it('should correctly renders info', () => {
    render(<ErrorComponent error={{ data: { message: 'some message' }, status: 400 }} />);
    expect(screen.getByText('some message, 400 code')).toBeOnTheScreen();
    expect(screen.getByText('An error occured')).toBeOnTheScreen();
  });
});
