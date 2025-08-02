import { JSX, PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { RenderOptions, render } from '@testing-library/react-native';
import { AppStore, mockStore } from './mock-store';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { store = mockStore, ...renderOptions }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren<object>): JSX.Element {
    return (
      <Provider store={store}>
        <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
