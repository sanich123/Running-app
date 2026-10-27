import { StyleSheet, View } from 'react-native';
import { useAppSelector } from '@R/typed-hooks';
import AddActivityMediaBtn from '@S/card/add-media-btn/add-activity-media-btn/add-activity-media-btn';
import FavoriteActivityBtn from '@S/card/favorite-activity-btn/favorite-activity-btn';
import MapMetaOverlay from '@S/card/map-meta-overlay/map-meta-overlay';
import RouteReplayBtn from '@S/card/route-replay-btn/route-replay-btn';
import { useActivityCard } from '../../context';

export default function ActivityMapOverlays() {
  const { activity } = useActivityCard();
  const {
    id,
    userId: activityOwnerId,
    profile,
    isFavorite,
    media,
    hideMap,
    locationName,
    weatherTemperature,
    weatherWindSpeed,
    weatherCode,
    emotion,
  } = activity;
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const isOwnActivity = activityOwnerId === currentUserId;
  const canShowRouteReplay = isOwnActivity || (profile?.allowActivityReplayViewing !== false && !hideMap);

  return (
    <>
      <MapMetaOverlay
        locationName={locationName}
        weatherTemperature={weatherTemperature}
        weatherWindSpeed={weatherWindSpeed}
        weatherCode={weatherCode}
        emotion={emotion}
      />
      {isOwnActivity ? (
        <View pointerEvents="box-none" style={styles.favoriteButton}>
          <FavoriteActivityBtn activityId={id} isFavorite={Boolean(isFavorite)} />
        </View>
      ) : null}
      {canShowRouteReplay ? (
        <View pointerEvents="box-none" style={styles.mapActions}>
          {isOwnActivity ? <AddActivityMediaBtn activityId={id} media={media ?? []} /> : null}
          <RouteReplayBtn activityId={id} userId={activityOwnerId} />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  favoriteButton: { position: 'absolute', right: 8, top: 8, zIndex: 4 },
  mapActions: {
    alignItems: 'center',
    bottom: 8,
    flexDirection: 'row',
    gap: 4,
    position: 'absolute',
    right: 8,
    zIndex: 3,
  },
});
