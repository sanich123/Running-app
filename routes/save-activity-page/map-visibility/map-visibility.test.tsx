import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { MAP_VISIBILITY } from './const';
import MapVisibility from './map-visibility';

const mockRouteParams: Record<string, string> = { hideMap: 'false' };
const mockSetParams = jest.fn((params: Record<string, string>) => Object.assign(mockRouteParams, params));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockRouteParams,
  useRouter: () => ({ setParams: mockSetParams }),
}));

describe('MapVisibility', () => {
  beforeEach(() => {
    mockRouteParams.hideMap = 'false';
    mockSetParams.mockClear();
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
  });

  it('opens a map preview from the row and updates the preview switch', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<MapVisibility />, { store: mockStore });

    await user.press(screen.getByText(MAP_VISIBILITY[LANGUAGES.russian].title));

    expect(screen.getByTestId('map-visibility-preview')).toHaveProp(
      'accessibilityLabel',
      MAP_VISIBILITY[LANGUAGES.russian].shown,
    );
    expect(screen.getByTestId('map-visibility-switch')).toBeOnTheScreen();

    await fireEvent(screen.getByTestId('map-visibility-switch'), 'valueChange', true);

    expect(mockSetParams).toHaveBeenCalledWith({ hideMap: 'true' });
  });

  it('shows the route-only map example when the activity map is hidden', async () => {
    const user = userEvent.setup();
    mockRouteParams.hideMap = 'true';
    await renderWithProviders(<MapVisibility />, { store: mockStore });

    await user.press(screen.getByText(MAP_VISIBILITY[LANGUAGES.russian].title));

    expect(screen.getByTestId('map-visibility-preview')).toHaveProp(
      'accessibilityLabel',
      MAP_VISIBILITY[LANGUAGES.russian].hidden,
    );
  });

  it('changes visibility directly from the segmented control without opening the preview', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<MapVisibility />, { store: mockStore });

    await user.press(screen.getByTestId('map-visibility-hidden'));

    expect(mockSetParams).toHaveBeenCalledWith({ hideMap: 'true' });
    expect(screen.queryByTestId('map-visibility-preview')).toBeNull();
  });
});
