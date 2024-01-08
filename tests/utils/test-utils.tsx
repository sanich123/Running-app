import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { AppStore, RootState } from './mock-store';
import activity from '../../redux/activity/activity';
import language from '../../redux/language/language';
import location from '../../redux/location/location';
import network from '../../redux/network/network';
import profile from '../../redux/profile/profile';
import { runichApi } from '../../redux/runich-api/runich-api';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: { network, language, location, profile, activity, [runichApi.reducerPath]: runichApi.reducer },
      preloadedState,
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren<object>): JSX.Element {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
