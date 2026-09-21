import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { EMOTIONS_BTNS_VALUES } from '@Routes/save-activity-page/emotion-btns/const';
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
    const mapUrl = 'https://cdn.example.test/activity-map-896x504.jpg';
    await renderWithProviders(<MediaList id="activity-id" mapPhotoUrl={mapUrl} media={[]} />);
    await user.press(screen.getByTestId(mapUrl));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.map}/activity-id`);
  });

  it('keeps the complete map image visible in the card preview', async () => {
    const mapUrl = 'https://cdn.example.test/activity-map-896x504.jpg';
    await renderWithProviders(<MediaList id="activity-id" mapPhotoUrl={mapUrl} media={[]} />);

    expect(screen.getByTestId(mapUrl).props.contentFit).toBe('cover');
  });

  it('uses the map blurhash and prioritized disk cache for fast scrolling', async () => {
    const mapUrl = 'https://cdn.example.test/activity-map-896x504.jpg';
    await renderWithProviders(
      <MediaList id="activity-id" mapPhotoUrl={mapUrl} mapPhotoUrlBlurhash="map-blurhash" media={[]} />,
    );

    expect(screen.getByTestId(mapUrl).props).toEqual(
      expect.objectContaining({
        placeholder: 'map-blurhash',
        placeholderContentFit: 'cover',
        priority: 'high',
        cachePolicy: 'memory-disk',
        recyclingKey: mapUrl,
      }),
    );
  });

  it('renders location and weather over the map preview', async () => {
    const mapUrl = 'https://cdn.example.test/activity-map-896x504.jpg';
    await renderWithProviders(
      <MediaList
        id="activity-id"
        mapPhotoUrl={mapUrl}
        media={[]}
        locationName="Очень длинное название населённого пункта"
        weatherTemperature={18}
        weatherWindSpeed={6}
        weatherCode={0}
        emotion={EMOTIONS_BTNS_VALUES.good}
      />,
    );

    expect(screen.getByText('Очень длинное название населённого пункта')).toHaveProp('numberOfLines', 1);
    expect(screen.getByText('Очень длинное название населённого пункта')).toHaveProp('ellipsizeMode', 'tail');
    expect(screen.getByText('18°C')).toBeOnTheScreen();
    expect(screen.getByText('6 м/с')).toBeOnTheScreen();
    expect(screen.getByTestId('map-emotion-icon')).toBeOnTheScreen();
  });

  it('continues covering regular photos in the card preview', async () => {
    const photoUrl = 'https://images.example.test/activity.jpg';
    await renderWithProviders(
      <MediaList id="activity-id" mapPhotoUrl={undefined} media={[{ url: photoUrl, thumbnail: null }]} />,
    );

    expect(screen.getByTestId(photoUrl).props.contentFit).toBe('cover');
  });

  it('opens the selected activity media', async () => {
    const user = userEvent.setup();
    const photoUrl = 'https://images.example.test/activity.jpg';
    await renderWithProviders(
      <MediaList id="activity-id" mapPhotoUrl={undefined} media={[{ url: photoUrl, thumbnail: null }]} />,
    );
    await user.press(screen.getByTestId(photoUrl));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.media}/activity-id?indexOfPhoto=0`);
  });
});
