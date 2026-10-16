import { useRouter } from 'expo-router';
import { Icon } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { activityApi } from '@R/services/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import MapMetaButton from '@S/card/map-meta-overlay/map-meta-button';
import { ROUTE_REPLAY_BUTTON_COPY } from './const';

export default function RouteReplayBtn({ activityId, userId }: { activityId: string; userId: string }) {
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ settings }) => settings);
  const { isLoading } = useAppSelector(({ loading }) => loading);
  const copy = ROUTE_REPLAY_BUTTON_COPY[language];

  return (
    <MapMetaButton
      testID="activity-card-route-replay-button"
      accessibilityLabel={copy.open}
      onPress={() => {
        void dispatch(
          activityApi.util.prefetch('getLocationsByActivityId', { activityId, replay: true }, { ifOlderThan: 60 }),
        );
        push(`/${ROUTES.map}/${activityId}?replay=1&userId=${encodeURIComponent(userId)}`);
      }}
      disabled={isLoading}>
      <Icon source="play-circle-outline" size={20} color="#FFFFFF" />
    </MapMetaButton>
  );
}
