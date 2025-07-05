import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {  showCrossPlatformToast } from './custom-toast';

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
