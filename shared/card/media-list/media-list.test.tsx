import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import MediaList from './media-list';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@S/custom-image/custom-image', () => ({
  __esModule: true,
  default: (props: { testID?: string; contentFit?: string }) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
}));

describe('media list', () => {
  it('opens the route map when its preview is pressed', async () => {
    const user = userEvent.setup();
    const mapUrl = 'https://api.mapbox.com/styles/v1/map.png';
    await renderWithProviders(<MediaList id="activity-id" mapPhotoUrl={mapUrl} photoVideoUrls={[]} />);
    await user.press(screen.getByTestId(mapUrl));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.map}/activity-id`);
  });

  it('keeps the complete map image visible in the card preview', async () => {
    const mapUrl = 'https://api.mapbox.com/styles/v1/map.png';
    await renderWithProviders(<MediaList id="activity-id" mapPhotoUrl={mapUrl} photoVideoUrls={[]} />);

    expect(screen.getByTestId(mapUrl).props.contentFit).toBe('contain');
  });

  it('continues covering regular photos in the card preview', async () => {
    const photoUrl = 'https://images.example.test/activity.jpg';
    await renderWithProviders(
      <MediaList id="activity-id" mapPhotoUrl={undefined} photoVideoUrls={[{ url: photoUrl, thumbnail: null }]} />,
    );

    expect(screen.getByTestId(photoUrl).props.contentFit).toBe('cover');
  });

  it('opens the selected activity media', async () => {
    const user = userEvent.setup();
    const photoUrl = 'https://images.example.test/activity.jpg';
    await renderWithProviders(
      <MediaList id="activity-id" mapPhotoUrl={undefined} photoVideoUrls={[{ url: photoUrl, thumbnail: null }]} />,
    );
    await user.press(screen.getByTestId(photoUrl));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.media}/activity-id?indexOfPhoto=0`);
  });
});
