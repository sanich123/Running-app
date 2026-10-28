import { screen } from '@testing-library/react-native';
import { restoreLocationsFromJournal } from '@R/slices/location/location';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import { mockStore, resetMockLocation } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import PauseMarker from './pause-marker/pause-marker';
import PauseMarkers from './pause-markers';

describe('pause markers', () => {
  beforeEach(() => {
    mockStore.dispatch(resetMockLocation());
  });

  it('renders pause and resume marker variants', async () => {
    const pause = await renderWithProviders(<PauseMarker location={MOCK_LOCATION} isResume={false} />);
    expect(pause.toJSON()).toBeTruthy();

    const resume = await renderWithProviders(<PauseMarker location={MOCK_LOCATION} isResume />);
    expect(resume.toJSON()).toBeTruthy();
  });

  it('renders markers between non-empty location segments', async () => {
    const result = await renderWithProviders(<PauseMarkers locations={[[MOCK_LOCATION], [MOCK_LOCATION]]} />);

    expect(result.toJSON()).toBeTruthy();
  });

  it('handles segments without a pause or resume location', async () => {
    const result = await renderWithProviders(<PauseMarkers locations={[[], []]} />);

    expect(result.toJSON()).toBeTruthy();
  });

  it('reads paused route segments from Redux when they are not passed as props', async () => {
    mockStore.dispatch(
      restoreLocationsFromJournal({
        locationsFromBackground: [],
        locationsWithPauses: [[MOCK_LOCATION], [MOCK_LOCATION]],
      }),
    );

    await renderWithProviders(<PauseMarkers />);

    expect(screen.getAllByTestId('pause-marker')).toHaveLength(2);
  });
});
