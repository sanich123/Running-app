import { errorToast } from '@S/error-toast/error-toast';
import { reportPersistenceError, subscribeToPersistenceErrors } from './persistence-errors';

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));

describe('persistence errors', () => {
  it('waits for the Toast host before showing an early rehydration error', () => {
    const error = new Error('MMKV read failed');

    reportPersistenceError('Не удалось восстановить данные приложения', error);

    expect(errorToast).not.toHaveBeenCalled();

    const listener = jest.fn(({ message, error: reportedError }) => errorToast(message, reportedError));
    const unsubscribe = subscribeToPersistenceErrors(listener);

    expect(errorToast).toHaveBeenCalledWith('Не удалось восстановить данные приложения', error);

    reportPersistenceError('Не удалось сохранить данные приложения', error);

    expect(errorToast).toHaveBeenCalledWith('Не удалось сохранить данные приложения', error);

    unsubscribe();
  });
});
