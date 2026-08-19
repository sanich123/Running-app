import Toast from 'react-native-toast-message';

interface RunichErrorBody {
  message?: string | string[];
  statusCode?: number;
  error?: string;
}

export function getErrorMessageFromError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return error ? String(error) : 'Неизвестная ошибка';
  }

  if ('status' in error && 'data' in error) {
    const status = error.status;
    const data = error.data as RunichErrorBody | string | undefined;
    if (typeof data === 'string') return `${status}: ${data}`;
    const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message || data?.error;
    return message ? `${status}, ${message}` : `Статус ${status}`;
  }
  if ('status' in error) {
    const { status } = error as { status: unknown; originalStatus?: unknown };
    if (status === 'FETCH_ERROR') {
      return 'Отсутствует соединение с Интернет';
    }
    if (status === 'TIMEOUT_ERROR') {
      return 'Не удалось получить ответ от сервера в течение 35 секунд. Возможно, есть проблемы с интернет-соединением';
    }
    return `Статус ${status}${'originalStatus' in error ? `, ${(error as { originalStatus?: unknown }).originalStatus}` : ''}`;
  }
  if ('code' in error) {
    const typedError = error as { code?: unknown; message?: unknown };
    return `Код ${typedError.code}, сообщение: ${typedError.message || 'неизвестная ошибка'}`;
  }
  if ('message' in error) return String((error as { message?: unknown }).message);
  return JSON.stringify(error).slice(0, 250);
}

export function errorToast(message = '', error?: unknown) {
  return Toast.show({
    type: 'error',
    text2: [message, error && getErrorMessageFromError(error)].filter(Boolean).join(' '),
  });
}
