import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { MAPS_PAGE_COPY } from '../const';
import MapControls from './map-controls';

const copy = MAPS_PAGE_COPY[LANGUAGES.russian];

describe('map controls', () => {
  it('runs map style, perspective, location and search actions', async () => {
    const onToggleMapStyle = jest.fn();
    const onTogglePitch = jest.fn();
    const onLocate = jest.fn();
    const onSearch = jest.fn();
    const user = userEvent.setup();

    await renderWithProviders(
      <MapControls
        copy={copy}
        isSatellite
        is3d
        onToggleMapStyle={onToggleMapStyle}
        onTogglePitch={onTogglePitch}
        onLocate={onLocate}
        onSearch={onSearch}
      />,
    );

    await user.press(screen.getByTestId('toggle-map-style'));
    await user.press(screen.getByTestId('toggle-map-pitch'));
    await user.press(screen.getByTestId('center-map-on-location'));
    await user.press(screen.getByTestId('open-map-search'));

    expect(onToggleMapStyle).toHaveBeenCalledTimes(1);
    expect(onTogglePitch).toHaveBeenCalledTimes(1);
    expect(onLocate).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});
