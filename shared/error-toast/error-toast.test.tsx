import Toast from 'react-native-toast-message';
import { errorToast, getErrorMessageFromError } from './error-toast';

jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));

describe('errorToast', () => {
  it.each([
    [{ data: { message: 'Invalid input' }, status: 400 }, 'Invalid input, 400 code'],
    [{ status: 'FETCH_ERROR' }, 'Отсутствует соединение с Интернет'],
    [{ code: 'ENOENT', message: 'Missing' }, 'Код ENOENT, сообщение: Missing'],
  ])('normalizes API errors', (error, expected) => {
    expect(getErrorMessageFromError(error)).toBe(expected);
  });

  it('shows the normalized error', () => {
    errorToast('Request failed', { status: 'FETCH_ERROR' });
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text2: 'Request failed Отсутствует соединение с Интернет',
    });
  });
});
