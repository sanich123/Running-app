import { render, screen, userEvent } from '@testing-library/react-native';

import EmailInput from './email-input';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Email input', () => {
  it('should correctly renders', () => {
    render(
      <EmailInput email="" setEmail={jest.fn()} emailError={false} setEmailError={jest.fn()} isDisabled={false} />,
    );
    expect(screen.getByRole('text')).toBeOnTheScreen();
    expect(screen.getByText('Email must be valid email address')).toBeOnTheScreen();
  });
  it('should correctly handle typing', async () => {
    const setEmailFn = jest.fn();
    const setEmailError = jest.fn();
    renderWithProviders(
      <EmailInput email="" setEmail={setEmailFn} setEmailError={setEmailError} emailError={false} isDisabled={false} />,
      { store: mockStore },
    );
    const emailInput = screen.getByTestId('inputEmail');
    await userEvent.type(emailInput, 'some');
    expect(setEmailFn).toHaveBeenCalledTimes(4);
    expect(setEmailFn).toHaveBeenLastCalledWith('e');
  });
  it('should correctly handle email errors', async () => {
    const setEmailFn = jest.fn();
    const setEmailError = jest.fn();
    renderWithProviders(
      <EmailInput email="" setEmail={setEmailFn} setEmailError={setEmailError} emailError={false} isDisabled={false} />,
      { store: mockStore },
    );
    const emailInput = screen.getByTestId('inputEmail');
    await userEvent.type(emailInput, 'some');
    expect(setEmailError).toHaveBeenCalledTimes(5);
    expect(setEmailError).toHaveBeenCalledWith(true);
  });
  it('should correctly handle when isDisabled', () => {
    const setEmailFn = jest.fn();
    const setEmailError = jest.fn();
    renderWithProviders(
      <EmailInput email="" setEmail={setEmailFn} setEmailError={setEmailError} emailError={false} isDisabled />,
      { store: mockStore },
    );
    const emailInput = screen.getByTestId('inputEmail');
    expect(emailInput).toBeDisabled();
  });
});
