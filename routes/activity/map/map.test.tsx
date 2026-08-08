import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { getCurrentPositionAsync } from 'expo-location';
import { setUserId } from '@R/slices/auth/auth';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import Map from './map';

const mockSetCamera = jest.fn();
jest.mock('@rnmapbox/maps', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  const Camera = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({ setCamera: mockSetCamera }));
    return <View testID="recording-map-camera" {...props} />;
  });
  return { MapView: View, Camera, UserLocation: View };
});
jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(),
  useForegroundPermissions: () => [{ granted: true }, jest.fn()],
  useBackgroundPermissions: () => [{ granted: true }, jest.fn()],
}));
jest.mock('@Routes/activity/battery-optimization-modal/battery-optimization-modal', () => () => null);
jest.mock('@Routes/activity/map/map-km-split/map-km-split', () => () => null);
jest.mock('@Routes/activity/map/map-route-line/map-route-line', () => () => null);
jest.mock('../location-indicator/location-indicator', () => () => null);
jest.mock('./location-permissions/location-permissions', () => () => null);

describe('activity recording map', () => {
  beforeEach(() => mockSetCamera.mockClear());

  it('marks recording ready and recenters the camera on the current location', async () => {
    const user = userEvent.setup();
    const setIsReadyToRecordLocation = jest.fn();
    mockStore.dispatch(setUserId(MOCK_SERVER_IDS.userId));
    (getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { longitude: 37.6, latitude: 55.7 } });
    await renderWithProviders(<Map setIsReadyToRecordLocation={setIsReadyToRecordLocation} />);
    await waitFor(() => expect(setIsReadyToRecordLocation).toHaveBeenCalledWith(true));
    await user.press(await screen.findByTestId('move-to-current-location'));
    await act(async () => jest.advanceTimersByTime(1000));
    expect(getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: 6 });
    expect(mockSetCamera).toHaveBeenCalledWith(
      expect.objectContaining({ centerCoordinate: [37.6, 55.7], zoomLevel: 18 }),
    );
  });

  it('changes the map zoom with the plus and minus controls', async () => {
    const user = userEvent.setup();
    const setIsReadyToRecordLocation = jest.fn();
    mockStore.dispatch(setUserId(MOCK_SERVER_IDS.userId));
    await renderWithProviders(<Map setIsReadyToRecordLocation={setIsReadyToRecordLocation} />);

    await user.press(await screen.findByTestId('increase-map-zoom'));
    expect(mockSetCamera).toHaveBeenCalledWith(expect.objectContaining({ zoomLevel: 19 }));

    await user.press(screen.getByTestId('decrease-map-zoom'));
    expect(mockSetCamera).toHaveBeenCalledWith(expect.objectContaining({ zoomLevel: 18 }));
  });
});
