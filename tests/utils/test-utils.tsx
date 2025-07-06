import { render } from '@testing-library/react-native';
import { JSX, PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { RenderOptions } from '@testing-library/react-native';
import { AppStore, mockStore } from './mock-store';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { store = mockStore, ...renderOptions }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren<object>): JSX.Element {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
