import mainFeed from '@R/main-feed/main-feed';
import { configureStore } from '@reduxjs/toolkit';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { AppStore } from './mock-store';
import activity from '../../redux/activity/activity';
import language from '../../redux/language/language';
import location from '../../redux/location/location';
import profile from '../../redux/profile/profile';
import network from '@R/network/network';
import { runichApi } from '../../redux/runich-api/runich-api';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    store = configureStore({
      reducer: { network, language, location, profile, activity, mainFeed, [runichApi.reducerPath]: runichApi.reducer },
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren<object>): JSX.Element {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
