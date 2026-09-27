import { getMigrationErrorMessage } from './utils';

describe('migration error messages', () => {
  it('converts the native compressor timeout stack into a short user-facing message', () => {
    expect(getMigrationErrorMessage(new Error('java.lang.Throwable: Read timed out\n\tat com.reactnativecompressor.Uploader'))).toBe(
      'Время ожидания загрузки истекло. Проверьте интернет-соединение и попробуйте снова.',
    );
  });

  it('keeps ordinary server error messages intact', () => {
    expect(getMigrationErrorMessage(new Error('Сервер вернул статус 413'))).toBe('Сервер вернул статус 413');
  });
});
