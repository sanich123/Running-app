import Mapbox from '@rnmapbox/maps';
import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { removeOfflineMap, renameOfflineMap } from '@U/offline-map-library';
import OfflineMapList from './offline-map-list';
import { MAPS_PAGE_COPY } from '../../const';

jest.mock('@rnmapbox/maps', () => ({ __esModule: true, default: { offlineManager: { deletePack: jest.fn() } } }));
jest.mock('@U/offline-map-library', () => ({ removeOfflineMap: jest.fn(), renameOfflineMap: jest.fn() }));

const copy = MAPS_PAGE_COPY[LANGUAGES.russian];
const offlineMap = { id: 'region-1', title: 'Москва' };

describe('offline map list', () => {
  beforeEach(() => {
    jest.mocked(renameOfflineMap).mockReset();
    jest.mocked(removeOfflineMap).mockReset();
    jest.mocked(Mapbox.offlineManager.deletePack).mockReset();
  });

  it('renames and removes a downloaded map', async () => {
    const onMapsChange = jest.fn();
    jest.mocked(renameOfflineMap).mockResolvedValue([{ ...offlineMap, title: 'Центр' }]);
    jest.mocked(Mapbox.offlineManager.deletePack).mockResolvedValue(undefined);
    jest.mocked(removeOfflineMap).mockResolvedValue([]);
    const user = userEvent.setup();
    await renderWithProviders(<OfflineMapList maps={[offlineMap]} copy={copy} onMapsChange={onMapsChange} />);

    await user.press(screen.getByLabelText(copy.rename));
    const input = screen.getByDisplayValue(offlineMap.title);
    await user.clear(input);
    await user.type(input, 'Центр');
    await user.press(screen.getByLabelText(copy.save));
    await waitFor(() => expect(onMapsChange).toHaveBeenCalledWith([{ ...offlineMap, title: 'Центр' }]));

    await user.press(screen.getByLabelText(copy.delete));
    await waitFor(() => expect(Mapbox.offlineManager.deletePack).toHaveBeenCalledWith(offlineMap.id));
    expect(removeOfflineMap).toHaveBeenCalledWith(offlineMap.id);
    expect(onMapsChange).toHaveBeenLastCalledWith([]);
  });
});
