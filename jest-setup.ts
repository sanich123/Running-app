import 'react-native-gesture-handler/jestSetup';
import { cleanup } from '@testing-library/react-native';
import { runichApi } from './redux/runich-api/runich-api';
import { mockStore } from './tests/utils/mock-store';
import { server } from './tests/utils/server';
import type * as ExpoLinking from 'expo-linking';

let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  }),
}));

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
jest.mock('expo-media-library', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  createAssetAsync: jest.fn(() => Promise.resolve({ id: 'mock-asset' })),
  saveToLibraryAsync: jest.fn(() => Promise.resolve()),
  usePermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
}));
jest.mock('@rnmapbox/maps', () => {
  const { View } = jest.requireActual('react-native');
  return {
    MapView: View,
    Camera: View,
    UserLocation: View,
    ShapeSource: View,
    LineLayer: View,
    CircleLayer: View,
    SymbolLayer: View,
    PointAnnotation: View,
    MarkerView: View,
    Callout: View,
  };
});
jest.mock('react-native-gifted-charts', () => {
  const { View } = jest.requireActual('react-native');
  return { BarChart: View };
});
jest.mock('mapbox-gl', () => ({
  Map: jest.fn(() => ({
    addControl: jest.fn(),
    addLayer: jest.fn(),
    addSource: jest.fn(),
    remove: jest.fn(),
    on: jest.fn(),
  })),
  Marker: jest.fn(() => ({ setLngLat: jest.fn().mockReturnThis(), addTo: jest.fn().mockReturnThis() })),
  NavigationControl: jest.fn(),
}));
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
  const { createElement } = jest.requireActual('react');
  const reactNative = jest.requireActual('react-native');
  const { View, FlatList, ScrollView, TextInput, TouchableOpacity } = reactNative;

  return {
    __esModule: true,
    default: View,
    BottomSheetTextInput: TextInput,
    BottomSheetModal: ({ children, footerComponent: FooterComponent }: any) =>
      createElement(
        View,
        null,
        children,
        FooterComponent ? createElement(FooterComponent, { animatedFooterPosition: { get: () => 0 } }) : null,
      ),
    BottomSheetModalProvider: View,
    BottomSheetFooter: ({ children }: any) => createElement(View, null, children),
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
  const module: typeof ExpoLinking = {
    ...jest.requireActual('expo-linking'),
    createURL: jest.fn(),
    openSettings: jest.fn(() => Promise.resolve()),
    openURL: jest.fn(() => Promise.resolve({} as never)),
  };

  return module;
});

jest.mock('expo-vpn-checker', () => ({
  __esModule: true,
  default: { checkVpn: jest.fn(() => false) },
}));

jest.mock('react-native-compressor', () => ({
  Image: { compress: jest.fn(async (uri: string) => uri) },
  Video: { compress: jest.fn(async (uri: string) => uri) },
  getVideoMetaData: jest.fn(async () => ({})),
}));

jest.mock('expo-video', () => {
  const reactNative = jest.requireActual('react-native');
  const { View } = reactNative;

  return {
    VideoView: View,
    useVideoPlayer: () => ({}),
  };
});

jest.mock('expo-location', () => ({
  Accuracy: { High: 6 },
  getCurrentPositionAsync: () => Promise.resolve({ coords: { latitude: 0, longitude: 0 } }),
  getLastKnownPositionAsync: () => Promise.resolve({ coords: { latitude: 0, longitude: 0 }, timestamp: Date.now() }),
  hasStartedLocationUpdatesAsync: () => Promise.resolve(false),
  startLocationUpdatesAsync: () => Promise.resolve(),
  stopLocationUpdatesAsync: () => Promise.resolve(),
  watchPositionAsync: () => Promise.resolve({ remove: jest.fn() }),
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
afterEach(async () => {
  await cleanup();
  mockStore.dispatch(runichApi.util.resetApiState());
  consoleErrorSpy.mockRestore();
  jest.clearAllMocks();
  server.resetHandlers();
});
