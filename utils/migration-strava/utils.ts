import { errorToast } from '@S/error-toast/error-toast';
import type { MigrationCancelHandler } from './types';

export class MigrationArchiveCancelledError extends Error {
  constructor() {
    super('Отправка архива отменена');
    this.name = 'MigrationArchiveCancelledError';
  }
}

export class MigrationArchiveOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MigrationArchiveOperationError';
  }
}

export function isMigrationArchiveOperationError(error: unknown): error is MigrationArchiveOperationError {
  return error instanceof MigrationArchiveOperationError;
}

export function getMigrationErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : getSerializedError(error);
  return normalizeMigrationErrorMessage(message);
}

function getSerializedError(error: unknown) {
  if (typeof error === 'string') return error;

  try {
    return JSON.stringify(error) || 'Неизвестная ошибка';
  } catch {
    return 'Неизвестная ошибка';
  }
}

function normalizeMigrationErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('read timed out') || normalizedMessage.includes('timeout')) {
    return 'Время ожидания загрузки истекло. Проверьте интернет-соединение и попробуйте снова.';
  }

  if (
    normalizedMessage.includes('unable to resolve host') ||
    normalizedMessage.includes('failed to connect') ||
    normalizedMessage.includes('network is unreachable')
  ) {
    return 'Не удалось подключиться к серверу. Проверьте интернет-соединение и попробуйте снова.';
  }

  if (normalizedMessage.includes('connection reset') || normalizedMessage.includes('connection aborted')) {
    return 'Соединение с сервером прервано. Проверьте интернет-соединение и попробуйте снова.';
  }

  if (message.includes('\n') && normalizedMessage.startsWith('java.')) {
    return 'Не удалось передать архив. Попробуйте снова.';
  }

  return message;
}

export function reportMigrationError(message: string, error: unknown, setIsError: (value: string) => void) {
  const fullMessage = `${message}: ${getMigrationErrorMessage(error)}`;
  setIsError(fullMessage);
  errorToast(message, error);
  return new MigrationArchiveOperationError(fullMessage);
}

export function throwMigrationError(message: string, setIsError: (value: string) => void): never {
  const error = new MigrationArchiveOperationError(message);
  setIsError(message);
  errorToast(message, error);
  throw error;
}

export function createMigrationCancellation() {
  let isCancelled = false;
  let cancelRequest: MigrationCancelHandler = null;

  return {
    cancel: () => {
      isCancelled = true;
      cancelRequest?.();
    },
    setCancelRequest: (cancel: MigrationCancelHandler) => {
      cancelRequest = cancel;
    },
    throwIfCancelled: () => {
      if (isCancelled) throw new MigrationArchiveCancelledError();
    },
  };
}

/** Convert either a filesystem path or an Expo file URI to a file URI. */
export function toFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`;
}
