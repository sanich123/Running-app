import { errorToast } from '@C/shared/error-toast/error-toast';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export function errorHandler(err: unknown) {
  errorToast('', err);
}

export function errorExtracter(error: FetchBaseQueryError | SerializedError) {
  if ('data' in error && error.data && typeof error.data === 'object' && 'statusCode' in error.data) {
    return error.data.statusCode;
  }
  if ('status' in error) {
    return error.status;
  }
  if ('statusCode' in error) return error.statusCode;
  return null;
}
