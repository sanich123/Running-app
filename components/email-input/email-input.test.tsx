import { render, screen } from '@testing-library/react-native';

import EmailInput from './email-input';
// import { mockStore } from '../../tests/utils/mock-store';
// import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Email input', () => {
  it('should correctly renders', () => {
    render(<EmailInput />);
    expect(screen.getByRole('text')).toBeOnTheScreen();
    expect(screen.getByText('Email must be valid email address')).toBeOnTheScreen();
  });
  // it('should interract with the user and display typed text', async () => {
  //   renderWithProviders(<EmailInput />, { store: mockStore });
  //   const emailInput = screen.getByTestId('inputEmail');
  //   await userEvent.type(emailInput, 'some');
  //   expect(emailInput.props.value).toEqual('some');
  // });
});
