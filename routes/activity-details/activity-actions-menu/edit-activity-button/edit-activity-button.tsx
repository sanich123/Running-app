import { useRouter } from 'expo-router';
import { ACTIVITY_VISIBILITY } from '@const/activity-visibility';
import { ROUTES } from '@const/enums';
import { addPhotoUrls, resetActivityDraft, resetFinishedActivity } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { getHoursMinutesSecondsFromMilliseconds } from '@U/time-formatter';
import { ACTIVITY_ACTIONS_MENU, ACTIVITY_ACTIONS_MENU_TEST_IDS } from '../const';
import MenuItem from '../menu-item/menu-item';
import type { EditActivityButtonProps } from './types';

export default function EditActivityButton({ activity }: EditActivityButtonProps) {
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ settings }) => settings);

  return (
    <MenuItem
      action="edit"
      label={ACTIVITY_ACTIONS_MENU[language].edit}
      testID={ACTIVITY_ACTIONS_MENU_TEST_IDS.edit}
      onPress={() => {
        dispatch(resetFinishedActivity());
        dispatch(resetActivityDraft());

        if (activity.media) {
          dispatch(addPhotoUrls(activity.media));
        }

        const { hours, minutes, seconds } = getHoursMinutesSecondsFromMilliseconds(activity.duration);
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
      }}
    />
  );
}
