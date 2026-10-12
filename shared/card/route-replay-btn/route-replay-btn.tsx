import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { activityApi } from '@R/services/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ROUTE_REPLAY_BUTTON_COPY } from './const';

export default function RouteReplayBtn({ activityId, userId }: { activityId: string; userId: string }) {
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { colors, dark } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { isLoading } = useAppSelector(({ loading }) => loading);
  const copy = ROUTE_REPLAY_BUTTON_COPY[language];

  return (
    <IconButton
      mode="contained-tonal"
      icon="play-circle-outline"
      iconColor={colors.primary}
      containerColor={dark ? 'rgba(38, 38, 38, 0.68)' : 'rgba(255, 255, 255, 0.68)'}
      size={23}
      style={styles.iconButton}
      onPress={() => {
        void dispatch(
          activityApi.util.prefetch('getLocationsByActivityId', { activityId, replay: true }, { ifOlderThan: 60 }),
        );
        push(`/${ROUTES.map}/${activityId}?replay=1&userId=${encodeURIComponent(userId)}`);
      }}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={copy.open}
      testID="activity-card-route-replay-button"
    />
  );
}

const styles = StyleSheet.create({
  iconButton: { height: 40, marginHorizontal: 0, width: 40 },
});
