import { showCrossPlatformToast } from './custom-toast';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export function errorHandler(err: unknown) {
  if (err instanceof Error) {
    showCrossPlatformToast(err.message);
  }
}

export function errorExtracter(error: FetchBaseQueryError | SerializedError) {
  if ('status' in error) {
    return error.status;
  }
  return null;
}
