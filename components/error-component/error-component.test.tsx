import { render, screen } from '@testing-library/react-native';

import ErrorComponent from './error-component';

describe('Error component', () => {
  it('should correctly renders info', () => {
    render(<ErrorComponent error={{ data: { message: 'some message' }, status: 200 }} />);
    expect(screen.getByText('some message, 200 code')).toBeOnTheScreen();
  });
});
