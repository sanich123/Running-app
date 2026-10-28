import { useAppSelector } from '@R/typed-hooks';
import UserAvatarMarker from '@S/display-activity-map/user-avatar-marker/user-avatar-marker';

export default function MapNavIcon() {
  const { lastPosition, initialLocation } = useAppSelector(({ location }) => location);
  const currentPosition = lastPosition ?? initialLocation;

  return currentPosition?.coords ? (
    <UserAvatarMarker
      coordinate={[currentPosition.coords.longitude, currentPosition.coords.latitude]}
      positionTimestamp={currentPosition.timestamp}
      animateCoordinate
      testID="map-nav-avatar"
    />
  ) : null;
}
