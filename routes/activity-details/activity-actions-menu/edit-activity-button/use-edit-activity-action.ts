import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ACTIVITY_VISIBILITY } from '@const/activity-visibility';
import { ROUTES } from '@const/enums';
import { addPhotoUrls, resetActivityDraft, resetFinishedActivity } from '@R/slices/activity/activity';
import { useAppDispatch } from '@R/typed-hooks';
import { getHoursMinutesSecondsFromMilliseconds } from '@U/time-formatter';
import type { ActivityResponse } from '@R/runich-api/types';

export default function useEditActivityAction(activity?: ActivityResponse | null) {
  const { push } = useRouter();
  const dispatch = useAppDispatch();

  return useCallback(() => {
    if (!activity) return;

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
        hideMap: String(Boolean(activity.hideMap)),
        hasMapPhoto: String(Boolean(activity.mapPhotoUrl || activity.routeOnlyMapPhotoUrl)),
      },
    });
  }, [activity, dispatch, push]);
}
