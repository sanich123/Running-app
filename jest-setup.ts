import { server } from './tests/utils/server';

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

beforeAll(() => {
  jest.useFakeTimers();
  server.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => server.close());
afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});
