import { screen, userEvent } from '@testing-library/react-native';

import { EMAIL_INPUT, EMAIL_INPUT_TEST_ID } from './const';
import EmailInput from './email-input';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Email input', () => {
  it('should correctly renders', () => {
    renderWithProviders(
      <EmailInput email="" setEmail={jest.fn()} emailError={false} setEmailError={jest.fn()} isDisabled={false} />,
      { store: mockStore },
    );
    expect(screen.getByTestId(EMAIL_INPUT_TEST_ID)).toBeOnTheScreen();
    expect(screen.getByText(EMAIL_INPUT.english.helper)).toBeOnTheScreen();
  });
  it('should correctly handle typing', async () => {
    const setEmailFn = jest.fn();
    const setEmailError = jest.fn();
    renderWithProviders(
      <EmailInput email="" setEmail={setEmailFn} setEmailError={setEmailError} emailError={false} isDisabled={false} />,
      { store: mockStore },
    );
    const emailInput = screen.getByTestId(EMAIL_INPUT_TEST_ID);
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
    const emailInput = screen.getByTestId(EMAIL_INPUT_TEST_ID);
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
    const emailInput = screen.getByTestId(EMAIL_INPUT_TEST_ID);
    expect(emailInput).toBeDisabled();
  });
  it('should correctly render in russian', () => {
    const setEmailFn = jest.fn();
    const setEmailError = jest.fn();
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(
      <EmailInput email="" setEmail={setEmailFn} setEmailError={setEmailError} emailError={false} isDisabled />,
      { store: mockStore },
    );
    expect(screen.getByText(EMAIL_INPUT.russian.helper));
  });
});
