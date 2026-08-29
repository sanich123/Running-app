import Toast from 'react-native-toast-message';
import { errorToast, getErrorMessageFromError } from './error-toast';

jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));

describe('errorToast', () => {
  it.each([
    [{ data: { message: 'Invalid input' }, status: 400 }, '400, Invalid input'],
    [{ status: 'FETCH_ERROR' }, 'Отсутствует соединение с Интернет'],
    [{ code: 'ENOENT', message: 'Missing' }, 'Код ENOENT, сообщение: Missing'],
  ])('normalizes API errors', (error, expected) => {
    expect(getErrorMessageFromError(error)).toBe(expected);
  });

  it.each([
    [null, 'Неизвестная ошибка'],
    ['offline', 'offline'],
    [0, 'Неизвестная ошибка'],
    [true, 'true'],
    [{ status: 422, data: 'Unprocessable' }, '422: Unprocessable'],
    [{ status: 422, data: { message: ['First', 'Second'] } }, '422, First, Second'],
    [{ status: 422, data: { error: 'Invalid request' } }, '422, Invalid request'],
    [{ status: 422, data: {} }, 'Статус 422'],
    [{ status: 'TIMEOUT_ERROR' }, 'Не удалось получить ответ от сервера в течение 35 секунд. Возможно, есть проблемы с интернет-соединением'],
    [{ status: 500, originalStatus: 503 }, 'Статус 500, 503'],
    [{ status: 500 }, 'Статус 500'],
    [{ code: 'E_UNKNOWN' }, 'Код E_UNKNOWN, сообщение: неизвестная ошибка'],
    [{ message: 'Something went wrong' }, 'Something went wrong'],
    [{ details: 'fallback' }, '{"details":"fallback"}'],
  ])('normalizes %p', (error, expected) => {
    expect(getErrorMessageFromError(error)).toBe(expected);
  });

  it('shows the normalized error', () => {
    errorToast('Request failed', { status: 'FETCH_ERROR' });
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text2: 'Request failed Отсутствует соединение с Интернет',
    });
  });

  it('shows an empty message when no arguments are provided', () => {
    errorToast();

    expect(Toast.show).toHaveBeenCalledWith({ type: 'error', text2: '' });
  });
});
