import Toast from 'react-native-toast-message';
import { errorToast, getErrorMessageFromError } from './error-toast';

jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));

describe('errorToast', () => {
  it.each([
    [{ data: { message: 'Invalid input' }, status: 400 }, '400, Invalid input'],
    [{ status: 'FETCH_ERROR' }, 'Отсутствует соединение с Интернет'],
    [{ code: 'ENOENT', message: 'Missing' }, 'Код ENOENT, сообщение: Missing'],
  ])('normalizes API errors', (error, expected) => {
    expect(getErrorMessageFromError(error)).toBe(expected);
  });

  it.each([
    [null, 'Неизвестная ошибка'],
    ['offline', 'offline'],
    [0, 'Неизвестная ошибка'],
    [true, 'true'],
    [{ status: 422, data: 'Unprocessable' }, '422: Unprocessable'],
    [{ status: 422, data: { message: ['First', 'Second'] } }, '422, First, Second'],
    [{ status: 422, data: { error: 'Invalid request' } }, '422, Invalid request'],
    [{ status: 422, data: {} }, 'Статус 422'],
    [
      { status: 'TIMEOUT_ERROR' },
      'Не удалось получить ответ от сервера в течение 35 секунд. Возможно, есть проблемы с интернет-соединением',
    ],
    [{ status: 500, originalStatus: 503 }, 'Статус 500, 503'],
    [{ status: 500 }, 'Статус 500'],
    [{ code: 'E_UNKNOWN' }, 'Код E_UNKNOWN, сообщение: неизвестная ошибка'],
    [{ message: 'Something went wrong' }, 'Something went wrong'],
    [{ details: 'fallback' }, '{"details":"fallback"}'],
  ])('normalizes %p', (error, expected) => {
    expect(getErrorMessageFromError(error)).toBe(expected);
  });

  it('formats offline map diagnostics and removes credentials from messages', () => {
    const message = getErrorMessageFromError({
      name: 'OfflinePackError',
      message: 'failed with pk.message-secret',
      diagnostics: {
        platform: 'android',
        source: 'tileRegion',
        type: 'PARTIAL_LOAD',
        regionId: 'region-42',
        progress: {
          completedResourceCount: 9,
          erroredResourceCount: 2,
          requiredResourceCount: 11,
          loadedResourceCount: 7,
        },
        nativeDomain: 'Mapbox',
        nativeCode: 400,
        request: {
          style: 'https://api.mapbox.com/styles?access_token=pk.style-secret',
          minZoom: 6,
          maxZoom: 16,
          boundsOrder: 'northEast,southWest',
          boundsValid: true,
          latitudeSpanDegrees: 0.1,
          longitudeSpanDegrees: 0.2,
        },
        failureReason: 'bad token pk.reason-secret',
        recoverySuggestion: 'retry https://example.com/retry?key=secret',
        underlyingErrors: [
          { domain: 'Http', code: 400, message: 'url https://tiles.example.com/road?token=secret' },
          { code: 'unknown' },
          {},
          { domain: 'ignored', code: 500 },
        ],
      },
    });

    expect(message).toContain('OfflinePackError: failed with [redacted token]');
    expect(message).toContain('android; tileRegion; PARTIAL_LOAD; id=region-42');
    expect(message).toContain('ресурсы 9/11, ошибок 2, загружено 7');
    expect(message).toContain('native=Mapbox/400');
    expect(message).toContain('zoom 6–16');
    expect(message).toContain('boundsValid=true, order=northEast,southWest');
    expect(message).toContain('bounds Δlat=0.1°, Δlon=0.2°');
    expect(message).toContain('reason=bad token [redacted token]');
    expect(message).toContain('suggestion=retry https://example.com/retry');
    expect(message).toContain('underlying=Http/400: url https://tiles.example.com/road');
    expect(message).toContain('underlying=unknown/unknown');
    expect(message).not.toContain('secret');
  });

  it('omits absent or invalid offline diagnostics and keeps the generic Error name unprefixed', () => {
    expect(getErrorMessageFromError({ name: 'Error', message: 'plain message', diagnostics: {} })).toBe(
      'plain message',
    );
    expect(
      getErrorMessageFromError({
        name: 42,
        message: 'partial failure',
        diagnostics: {
          platform: 1,
          regionId: '',
          progress: { completedResourceCount: 3, erroredResourceCount: 1, requiredResourceCount: '4' },
          nativeCode: 503,
          request: { minZoom: 5, boundsValid: false },
          underlyingErrors: [],
        },
      }),
    ).toBe('partial failure [Mapbox offline: native=unknown/503; boundsValid=false, order=unknown]');
    expect(getErrorMessageFromError({ name: 'NetworkError', message: 4 })).toBe('NetworkError: 4');
    expect(getErrorMessageFromError({})).toBe('{}');
  });

  it('handles partial diagnostics without fabricating missing progress and request values', () => {
    expect(
      getErrorMessageFromError({
        name: 'Error',
        message: '',
        diagnostics: {
          diagnostics: 'ignored',
          progress: { completedResourceCount: 1, requiredResourceCount: 2, erroredResourceCount: 1 },
          nativeDomain: 'Cache',
          request: { minZoom: '6', maxZoom: 16, boundsOrder: '', boundsValid: false, latitudeSpanDegrees: 0.1 },
          underlyingErrors: [{ domain: '', code: '400', message: '' }],
        },
      }),
    ).toBe(
      ' [Mapbox offline: ресурсы 1/2, ошибок 1; native=Cache/unknown; boundsValid=false, order=unknown; underlying=unknown/unknown]',
    );
    expect(getErrorMessageFromError({ name: 'Error', message: 'no diagnostics', diagnostics: 'invalid' })).toBe(
      'no diagnostics',
    );
  });

  it('shows the normalized error', () => {
    errorToast('Request failed', { status: 'FETCH_ERROR' });
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text2: 'Request failed Отсутствует соединение с Интернет',
    });
  });

  it('shows an empty message when no arguments are provided', () => {
    errorToast();

    expect(Toast.show).toHaveBeenCalledWith({ type: 'error', text2: '' });
  });
});
