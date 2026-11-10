import { screen, userEvent } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { MAPS_PAGE_COPY } from '../const';
import MapSearchPanel from './map-search-panel';

jest.mock('expo-location', () => ({ geocodeAsync: jest.fn() }));

const copy = MAPS_PAGE_COPY[LANGUAGES.russian];

describe('map search panel', () => {
  beforeEach(() => jest.mocked(Location.geocodeAsync).mockReset());

  it('centers the map on the first place result', async () => {
    jest.mocked(Location.geocodeAsync).mockResolvedValue([{ latitude: 55.75, longitude: 37.61 }]);
    const onDismiss = jest.fn();
    const onSelectLocation = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <MapSearchPanel visible copy={copy} onDismiss={onDismiss} onSelectLocation={onSelectLocation} />,
    );

    await user.type(screen.getByTestId('map-search-input'), 'Москва');
    await user.press(screen.getByText(copy.searchSubmit));

    expect(Location.geocodeAsync).toHaveBeenCalledWith('Москва');
    expect(onSelectLocation).toHaveBeenCalledWith([37.61, 55.75]);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('shows an empty result message and keeps the panel open', async () => {
    jest.mocked(Location.geocodeAsync).mockResolvedValue([]);
    const onDismiss = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <MapSearchPanel visible copy={copy} onDismiss={onDismiss} onSelectLocation={jest.fn()} />,
    );

    await user.type(screen.getByTestId('map-search-input'), 'неизвестное место');
    await user.press(screen.getByText(copy.searchSubmit));

    expect(await screen.findByText(copy.searchNoResults)).toBeOnTheScreen();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('shows an error when the place search fails', async () => {
    jest.mocked(Location.geocodeAsync).mockRejectedValue(new Error('network error'));
    const user = userEvent.setup();
    await renderWithProviders(
      <MapSearchPanel visible copy={copy} onDismiss={jest.fn()} onSelectLocation={jest.fn()} />,
    );

    await user.type(screen.getByTestId('map-search-input'), 'Москва');
    await user.press(screen.getByText(copy.searchSubmit));

    expect(await screen.findByText(copy.searchFailed)).toBeOnTheScreen();
  });
});
