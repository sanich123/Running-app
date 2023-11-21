import '@testing-library/jest-native/extend-expect';
import 'dotenv/config';
import { fetch, Headers, Request, Response } from 'cross-fetch';

import { server } from './tests/utils/server';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('expo-font');
jest.mock('expo-asset');

global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

beforeAll(() => {
  jest.useFakeTimers();
  server.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => server.close());
afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});
