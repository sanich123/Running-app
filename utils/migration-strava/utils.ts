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
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  try {
    return JSON.stringify(error) || 'Неизвестная ошибка';
  } catch {
    return 'Неизвестная ошибка';
  }
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
