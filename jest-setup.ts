import 'react-native-gesture-handler/jestSetup';
import { server } from './tests/utils/server';

let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('redux-persist', () => {
  const actualReduxPersist = jest.requireActual('redux-persist');
  const resolvedPromise = () => Promise.resolve();

  return {
    ...actualReduxPersist,
    persistStore: jest.fn(() => ({
      dispatch: jest.fn(),
      flush: resolvedPromise,
      getState: jest.fn(() => ({ bootstrapped: true, registry: [] })),
      pause: jest.fn(),
      persist: jest.fn(),
      purge: resolvedPromise,
      subscribe: jest.fn(() => jest.fn()),
    })),
  };
});

jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('@A/supabase/supabase-init', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      setSession: jest.fn(),
    },
  },
}));
jest.mock('expo-image', () => {
  const { Image } = jest.requireActual('react-native');
  return { __esModule: true, default: Image, Image };
});
jest.mock('@gorhom/bottom-sheet', () => {
  const reactNative = jest.requireActual('react-native');
  const { View, FlatList, ScrollView, TextInput, TouchableOpacity } = reactNative;

  return {
    __esModule: true,
    default: View,
    BottomSheetTextInput: TextInput,
    BottomSheetModal: View,
    BottomSheetModalProvider: View,
    BottomSheetFlatList: FlatList,
    BottomSheetView: View,
    BottomSheetScrollView: ScrollView,
    useBottomSheetModal: () => ({
      present: () => {},
      dismiss: () => {},
    }),
    TouchableOpacity,
  };
});
jest.mock('expo-linking', () => {
  const module: typeof import('expo-linking') = {
    ...jest.requireActual('expo-linking'),
    createURL: jest.fn(),
  };

  return module;
});

jest.mock('expo-video', () => {
  const reactNative = jest.requireActual('react-native');
  const { View } = reactNative;

  return {
    VideoView: View,
    useVideoPlayer: () => ({}),
  };
});

jest.mock('expo-location', () => ({
  getCurrentPositionAsync: () => Promise.resolve({ coords: { latitude: 0, longitude: 0 } }),
  useForegroundPermissions: () => [jest.fn()],
  useBackgroundPermissions: () => [jest.fn()],
  PermissionStatus: { UNDETERMINED: 'UNDETERMINED', DENIED: 'DENIED' },
}));

jest.mock('react-native-keyboard-controller', () => {
  const reactNative = jest.requireActual('react-native');
  const { View } = reactNative;

  return {
    KeyboardAwareScrollView: View,
    KeyboardAvoidingView: View,
  };
});
beforeAll(() => {
  jest.useFakeTimers();
  server.listen({ onUnhandledRequest: 'error' });
});
beforeEach(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
    throw new Error(`Unexpected console.error: ${args.map(String).join(' ')}`);
  });
});
afterAll(() => server.close());
afterEach(() => {
  consoleErrorSpy.mockRestore();
  jest.clearAllMocks();
  server.resetHandlers();
});
