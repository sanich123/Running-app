import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';

export function getErrorMessageFromError(error: any) {
  if (error instanceof AxiosError) {
    const { status, code, message } = error;
    if (code === 'ERR_NETWORK') {
      return 'Невозможно соединиться с сервером. Отсутствует интернет-соединение.';
    }
    if (code === 'ERR_CANCELED') {
      return 'Загрузка была прервана пользователем';
    }
    return `${status}, ${code}, ${message}`;
  }
  if (error?.data?.errors?.length && error?.data?.errors?.length > 0) {
    const errorDetails = error?.data?.errors;
    return `${errorDetails.map((error: any) => ('detail' in error ? error?.detail : error))}, статус: ${error?.status}`;
  }
  if ('status' in error) {
    const { status } = error;
    if (status === 'FETCH_ERROR') {
      return 'Отсутствует соединение с Интернет';
    }
    if (status === 'TIMEOUT_ERROR') {
      return 'Не удалось получить ответ от сервера в течение 35 секунд. Возможно, есть проблемы с интернет-соединением';
    }
    return `Статус ${status}, ${error?.originalStatus}`;
  }
  if ('code' in error) {
    return `Код ${error?.code}, сообщение: ${error?.message}`;
  }
  return `${error ? JSON.stringify(error, null, 2)?.slice(0, 250) : ''}`;
}

export function errorToast(message: string, error?: any) {
  return Toast.show({
    type: 'error',
    text2: `${message}${error ? getErrorMessageFromError(error) : ''}`,
  });
}
