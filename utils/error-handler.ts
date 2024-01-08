import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { ToastDuration, showCrossPlatformToast } from './custom-toast';

export function errorHandler(err: unknown) {
  if (err instanceof Error) {
    showCrossPlatformToast(err.message, ToastDuration.long);
  }
}

export function errorExtracter(error: FetchBaseQueryError | SerializedError) {
  if ('status' in error) {
    return error.status;
  }
  return null;
}
