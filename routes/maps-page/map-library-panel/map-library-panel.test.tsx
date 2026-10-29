import type React from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { MAPS_PAGE_COPY } from '../const';
import MapLibraryPanel from './map-library-panel';

jest.mock('../offline-maps-tab/offline-maps-tab', () => ({
  __esModule: true,
  default: () => {
    const ReactModule = jest.requireActual('react') as typeof React;
    const { Text: NativeText } = jest.requireActual('react-native') as {
      Text: React.ComponentType<React.PropsWithChildren<{ testID?: string }>>;
    };
    return ReactModule.createElement(NativeText, { testID: 'offline-map-tab-content' }, 'offline-map-tab-content');
  },
}));
jest.mock('../saved-tracks-tab/saved-tracks-tab', () => ({
  __esModule: true,
  default: () => {
    const ReactModule = jest.requireActual('react') as typeof React;
    const { Text: NativeText } = jest.requireActual('react-native') as {
      Text: React.ComponentType<React.PropsWithChildren<{ testID?: string }>>;
    };
    return ReactModule.createElement(NativeText, { testID: 'saved-tracks-tab-content' }, 'saved-tracks-tab-content');
  },
}));

const copy = MAPS_PAGE_COPY[LANGUAGES.russian];

describe('map library panel', () => {
  it('switches between downloaded maps and saved tracks and dismisses', async () => {
    const onDismiss = jest.fn();
    const onTabChange = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <MapLibraryPanel visible tab="maps" copy={copy} onTabChange={onTabChange} onDismiss={onDismiss} />,
    );

    expect(screen.getByTestId('offline-map-tab-content')).toBeOnTheScreen();
    await user.press(screen.getByText(copy.tracks));
    expect(onTabChange).toHaveBeenCalledWith('tracks');
    await user.press(screen.getByLabelText(copy.close));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
