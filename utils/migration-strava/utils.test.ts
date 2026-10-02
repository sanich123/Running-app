import { errorToast } from '@S/error-toast/error-toast';
import {
  createMigrationCancellation,
  getMigrationErrorMessage,
  isMigrationArchiveOperationError,
  reportMigrationError,
  throwMigrationError,
  toFileUri,
} from './utils';

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));

describe('migration error messages', () => {
  it('converts the native compressor timeout stack into a short user-facing message', () => {
    expect(
      getMigrationErrorMessage(
        new Error('java.lang.Throwable: Read timed out\n\tat com.reactnativecompressor.Uploader'),
      ),
    ).toBe('Время ожидания загрузки истекло. Проверьте интернет-соединение и попробуйте снова.');
  });

  it('keeps ordinary server error messages intact', () => {
    expect(getMigrationErrorMessage(new Error('Сервер вернул статус 413'))).toBe('Сервер вернул статус 413');
  });

  it.each([
    [
      'Unable to resolve host api.example.test',
      'Не удалось подключиться к серверу. Проверьте интернет-соединение и попробуйте снова.',
    ],
    ['Network is unreachable', 'Не удалось подключиться к серверу. Проверьте интернет-соединение и попробуйте снова.'],
    ['Connection reset by peer', 'Соединение с сервером прервано. Проверьте интернет-соединение и попробуйте снова.'],
    ['Connection aborted', 'Соединение с сервером прервано. Проверьте интернет-соединение и попробуйте снова.'],
    ['java.lang.Exception\n at uploader.send', 'Не удалось передать архив. Попробуйте снова.'],
  ])('normalizes native or network error: %s', (message, expected) => {
    expect(getMigrationErrorMessage(message)).toBe(expected);
  });

  it('serializes unknown errors and safely falls back when serialization fails', () => {
    expect(getMigrationErrorMessage({ code: 'ARCHIVE_FAILED' })).toBe('{"code":"ARCHIVE_FAILED"}');
    expect(getMigrationErrorMessage(undefined)).toBe('Неизвестная ошибка');
    const circular: { self?: unknown } = {};
    circular.self = circular;
    expect(getMigrationErrorMessage(circular)).toBe('Неизвестная ошибка');
    expect(getMigrationErrorMessage('timeout')).toBe(
      'Время ожидания загрузки истекло. Проверьте интернет-соединение и попробуйте снова.',
    );
  });

  it('reports operation errors and exposes a throwing helper', () => {
    const setIsError = jest.fn();
    const operationError = reportMigrationError('Не удалось распаковать', new Error('connection reset'), setIsError);

    expect(isMigrationArchiveOperationError(operationError)).toBe(true);
    expect(setIsError).toHaveBeenCalledWith(
      'Не удалось распаковать: Соединение с сервером прервано. Проверьте интернет-соединение и попробуйте снова.',
    );
    expect(errorToast).toHaveBeenCalledWith('Не удалось распаковать', expect.any(Error));
    expect(() => throwMigrationError('Ошибка архива', setIsError)).toThrow('Ошибка архива');
    expect(setIsError).toHaveBeenLastCalledWith('Ошибка архива');
    expect(isMigrationArchiveOperationError(new Error('other'))).toBe(false);
  });

  it('cancels registered work and throws only after cancellation', () => {
    const cancellation = createMigrationCancellation();
    const cancelRequest = jest.fn();

    expect(cancellation.throwIfCancelled).not.toThrow();
    cancellation.cancel();
    expect(() => cancellation.throwIfCancelled()).toThrow('Отправка архива отменена');

    const nextCancellation = createMigrationCancellation();
    nextCancellation.setCancelRequest(cancelRequest);
    nextCancellation.cancel();
    expect(cancelRequest).toHaveBeenCalledTimes(1);
    expect(() => nextCancellation.throwIfCancelled()).toThrow('Отправка архива отменена');
  });

  it('preserves an existing file URI and converts a filesystem path', () => {
    expect(toFileUri('file:///cache/archive.zip')).toBe('file:///cache/archive.zip');
    expect(toFileUri('/cache/archive.zip')).toBe('file:///cache/archive.zip');
  });
});
