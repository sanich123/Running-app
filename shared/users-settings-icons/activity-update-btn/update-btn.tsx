import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { useTheme, Text, TouchableRipple } from 'react-native-paper';
import { ACTIVITY_SAVE_BTN } from '@const/activity-save-btn';
import { ACTIVITY_VISIBILITY } from '@const/activity-visibility';
import { ROUTES } from '@const/enums';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import { addPhotoUrls, resetActivityDraft, resetFinishedActivity } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { getHoursMinutesSecondsFromMilliseconds } from '@U/time-formatter';

export default function UpdateBtn() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ settings }) => settings);
  const { id: globalActivityId } = useGlobalSearchParams<{ id?: string | string[] }>();
  const pathname = usePathname();
  const routeActivityId = pathname.startsWith(`/${ROUTES.activity}/`) ? pathname.split('/').at(-1) : undefined;
  const activityId = routeActivityId ?? (Array.isArray(globalActivityId) ? globalActivityId[0] : globalActivityId);
  const { data: activity, error, isError, isLoading } = useGetActivityByActivityIdQuery(`${activityId}`);
  return (
    <TouchableRipple
      testID="activity-update-button"
      borderless
      style={{ paddingHorizontal: 5, paddingVertical: 5, borderRadius: 10, opacity: isLoading || isError ? 0.5 : 1 }}
      disabled={isError || isLoading}
      onPress={() => {
        if (activity) {
          dispatch(resetFinishedActivity());
          dispatch(resetActivityDraft());

          if (activity?.media) {
            dispatch(addPhotoUrls(activity?.media));
          }
          const { hours, minutes, seconds } = getHoursMinutesSecondsFromMilliseconds(activity?.duration);
          push({
            pathname: `/${ROUTES.manualActivity}`,
            params: {
              cameraVisible: 'false',
              id: activity.id,
              manualDate: new Date(activity.date).toISOString(),
              manualDistance: String(Number((activity.distance / 1000).toFixed(2))),
              manualHours: String(hours),
              manualMinutes: String(minutes),
              manualSeconds: String(seconds),
              mode: 'edit',
              title: activity.title ?? '',
              description: activity.description ?? '',
              sport: activity.sport,
              emotion: activity.emotion,
              visibility: activity.visibility ?? ACTIVITY_VISIBILITY.public,
            },
          });
        } else {
          errorToast('Не удалось загрузить данные об активности', error);
        }
      }}>
      <Text variant="titleMedium" style={{ color: colors.onSurfaceVariant }}>
        {ACTIVITY_SAVE_BTN[language].edit}
      </Text>
    </TouchableRipple>
  );
}
