import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { ToastAndroid } from 'react-native';

export function errorHandler(err: unknown) {
  if (err instanceof Error) {
    ToastAndroid.show(err.message, ToastAndroid.SHORT);
  }
}

export function errorExtracter(error: FetchBaseQueryError | SerializedError) {
  if ('status' in error) {
    return error.status;
  }
  return null;
}
