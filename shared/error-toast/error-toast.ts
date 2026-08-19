import { errorToast as showErrorToast, getErrorMessageFromError as getErrorMessage } from './utils';

export function errorToast(message = '', error?: unknown) {
  return showErrorToast(message, error);
}

export function getErrorMessageFromError(error: unknown) {
  return getErrorMessage(error);
}
