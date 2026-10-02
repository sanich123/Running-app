import { useAppSelector } from '@R/typed-hooks';
import UserAvatarMarker from '@S/display-activity-map/user-avatar-marker/user-avatar-marker';

export default function MapNavIcon({
  profilePhoto,
  name,
  surname,
}: {
  profilePhoto?: string | null;
  name?: string | null;
  surname?: string | null;
}) {
  const { lastPosition, initialLocation } = useAppSelector(({ location }) => location);
  const currentPosition = lastPosition ?? initialLocation;

  return (
    <>
      {currentPosition?.coords ? (
        <UserAvatarMarker
          coordinate={[currentPosition.coords.longitude, currentPosition.coords.latitude]}
          profilePhoto={profilePhoto}
          name={name}
          surname={surname}
          testID="map-nav-avatar"
        />
      ) : null}
    </>
  );
}
