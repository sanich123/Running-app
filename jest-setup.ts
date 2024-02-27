import '@testing-library/jest-native/extend-expect';
import 'dotenv/config';
import { fetch, Headers, Request, Response } from 'cross-fetch';

import { server } from './tests/utils/server';
require('@shopify/flash-list/jestSetup');

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('@A/supabase/supabase-init', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      setSession: jest.fn(),
    },
  },
}));
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
