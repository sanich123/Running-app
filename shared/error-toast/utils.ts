import Toast from 'react-native-toast-message';

interface RunichErrorBody {
  message?: string | string[];
  statusCode?: number;
  error?: string;
}

interface OfflineDiagnosticProgress {
  completedResourceCount?: unknown;
  erroredResourceCount?: unknown;
  requiredResourceCount?: unknown;
  loadedResourceCount?: unknown;
}

interface OfflineDiagnosticCause {
  domain?: unknown;
  code?: unknown;
  message?: unknown;
}

interface OfflineMapDiagnostics {
  platform?: unknown;
  source?: unknown;
  type?: unknown;
  regionId?: unknown;
  nativeDomain?: unknown;
  nativeCode?: unknown;
  failureReason?: unknown;
  recoverySuggestion?: unknown;
  progress?: OfflineDiagnosticProgress;
  underlyingErrors?: OfflineDiagnosticCause[];
  request?: {
    style?: unknown;
    minZoom?: unknown;
    maxZoom?: unknown;
    boundsOrder?: unknown;
    boundsValid?: unknown;
    latitudeSpanDegrees?: unknown;
    longitudeSpanDegrees?: unknown;
  };
}

function sanitizeDiagnosticText(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined;
  return value
    .replace(/\b(?:pk|sk)\.[A-Za-z0-9._~-]+/g, '[redacted token]')
    .replace(/(https?:\/\/[^\s?#]+)\?[^\s#]*/gi, '$1');
}

function formatOfflineMapDiagnostics(value: unknown): string {
  if (!value || typeof value !== 'object') return '';

  const diagnostics = value as OfflineMapDiagnostics;
  const parts = [diagnostics.platform, diagnostics.source, diagnostics.type]
    .map(sanitizeDiagnosticText)
    .filter((part): part is string => Boolean(part));
  const regionId = sanitizeDiagnosticText(diagnostics.regionId);
  if (regionId) parts.push(`id=${regionId}`);

  const progress = diagnostics.progress;
  if (
    progress &&
    typeof progress.completedResourceCount === 'number' &&
    typeof progress.requiredResourceCount === 'number' &&
    typeof progress.erroredResourceCount === 'number'
  ) {
    const loadedCount =
      typeof progress.loadedResourceCount === 'number' ? `, загружено ${progress.loadedResourceCount}` : '';
    parts.push(
      `ресурсы ${progress.completedResourceCount}/${progress.requiredResourceCount}, ошибок ${progress.erroredResourceCount}${loadedCount}`,
    );
  }

  if (typeof diagnostics.nativeDomain === 'string' || typeof diagnostics.nativeCode === 'number') {
    parts.push(`native=${diagnostics.nativeDomain ?? 'unknown'}/${diagnostics.nativeCode ?? 'unknown'}`);
  }

  const request = diagnostics.request;
  if (request) {
    const zoom =
      typeof request.minZoom === 'number' && typeof request.maxZoom === 'number'
        ? `zoom ${request.minZoom}–${request.maxZoom}`
        : undefined;
    const span =
      typeof request.latitudeSpanDegrees === 'number' && typeof request.longitudeSpanDegrees === 'number'
        ? `bounds Δlat=${request.latitudeSpanDegrees}°, Δlon=${request.longitudeSpanDegrees}°`
        : undefined;
    const bounds =
      typeof request.boundsValid === 'boolean'
        ? `boundsValid=${request.boundsValid}, order=${sanitizeDiagnosticText(request.boundsOrder) ?? 'unknown'}`
        : undefined;
    [sanitizeDiagnosticText(request.style), zoom, bounds, span]
      .filter((part): part is string => Boolean(part))
      .forEach((part) => parts.push(part));
  }

  const failureReason = sanitizeDiagnosticText(diagnostics.failureReason);
  if (failureReason) parts.push(`reason=${failureReason}`);
  const recoverySuggestion = sanitizeDiagnosticText(diagnostics.recoverySuggestion);
  if (recoverySuggestion) parts.push(`suggestion=${recoverySuggestion}`);
  if (Array.isArray(diagnostics.underlyingErrors)) {
    diagnostics.underlyingErrors.slice(0, 3).forEach((cause) => {
      const domain = sanitizeDiagnosticText(cause.domain) ?? 'unknown';
      const code = typeof cause.code === 'number' ? cause.code : 'unknown';
      const message = sanitizeDiagnosticText(cause.message);
      parts.push(`underlying=${domain}/${code}${message ? `: ${message}` : ''}`);
    });
  }

  return parts.length > 0 ? ` [Mapbox offline: ${parts.join('; ')}]` : '';
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
  if ('message' in error) {
    const typedError = error as { name?: unknown; message?: unknown };
    const safeName = sanitizeDiagnosticText(typedError.name);
    const errorName = safeName && safeName !== 'Error' ? `${safeName}: ` : '';
    const safeMessage = sanitizeDiagnosticText(String(typedError.message)) ?? String(typedError.message);
    const diagnostics = 'diagnostics' in error ? formatOfflineMapDiagnostics(error.diagnostics) : '';
    return `${errorName}${safeMessage}${diagnostics}`;
  }
  return JSON.stringify(error).slice(0, 250);
}

export function errorToast(message = '', error?: unknown) {
  return Toast.show({
    type: 'error',
    text2: [message, error && getErrorMessageFromError(error)].filter(Boolean).join(' '),
  });
}
