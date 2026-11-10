import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { MAPS_PAGE_COPY } from '../const';
import MapActions from './map-actions';

const copy = MAPS_PAGE_COPY[LANGUAGES.russian];

describe('map actions', () => {
  it('runs route import, offline maps, saved tracks and favorite workouts actions', async () => {
    const onImportRoute = jest.fn();
    const onDownloadOfflineMaps = jest.fn();
    const onShowSavedTracks = jest.fn();
    const onShowFavoriteActivities = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <MapActions
        copy={copy}
        onImportRoute={onImportRoute}
        onDownloadOfflineMaps={onDownloadOfflineMaps}
        onShowSavedTracks={onShowSavedTracks}
        onShowFavoriteActivities={onShowFavoriteActivities}
      />,
    );

    await user.press(screen.getByTestId('import-map-route'));
    await user.press(screen.getByTestId('download-offline-maps'));
    await user.press(screen.getByTestId('show-saved-tracks'));
    await user.press(screen.getByTestId('show-favorite-activities'));

    expect(onImportRoute).toHaveBeenCalledTimes(1);
    expect(onDownloadOfflineMaps).toHaveBeenCalledTimes(1);
    expect(onShowSavedTracks).toHaveBeenCalledTimes(1);
    expect(onShowFavoriteActivities).toHaveBeenCalledTimes(1);
  });
});
