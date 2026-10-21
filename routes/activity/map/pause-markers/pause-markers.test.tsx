import { MOCK_LOCATION } from '@T/mocks/mock-location';
import { renderWithProviders } from '@T/utils/test-utils';
import PauseMarker from './pause-marker/pause-marker';
import PauseMarkers from './pause-markers';

describe('pause markers', () => {
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
});
