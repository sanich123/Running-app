import type { JSX, PropsWithChildren } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { mockStore } from './mock-store';
import type { AppStore } from './mock-store';
import type { RenderOptions } from '@testing-library/react-native';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  store?: AppStore;
}

export async function renderWithProviders(
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
  return { store, ...(await render(ui, { wrapper: Wrapper, ...renderOptions })) };
}
