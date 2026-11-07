import { useRouter } from 'expo-router';
import { ACTIVITY_SAVE_BTN } from '@const/activity-save-btn';
import {
  useAddActivityByUserIdMutation,
  useUpdateActivityInfoMutation,
  useUploadRawActivityLocationsMutation,
} from '@R/services/activity/activity';
import { useUpdateSessionLocationMutation } from '@R/services/authentication/authentication';
import { setSavingDisabled } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useGlobalManualActivityParams } from '@Routes/save-activity-page/manual-activity-params';
import { errorToast } from '@S/error-toast/error-toast';
import { getMillisecondsFromHoursMinutesSeconds } from '@U/time-formatter';
import { ACTIVITY_SAVE_ERROR_COPY } from './const';
import { createActivitySaveActions } from './utils';

export function useSaveActivity() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isSavingDisabled, activeMediaUploadCount, finishedActivity, media } = useAppSelector(
    ({ activity }) => activity,
  );
  const { language } = useAppSelector(({ settings }) => settings);
  const params = useGlobalManualActivityParams();
  const { activityId, isManualAdding, isEditingActivity, manualDistance, manualHours, manualMinutes, manualSeconds } =
    params;
  const [sendActivity, { isLoading }] = useAddActivityByUserIdMutation();
  const [updateActivity, { isLoading: isUpdating }] = useUpdateActivityInfoMutation();
  const [uploadRawLocations] = useUploadRawActivityLocationsMutation();
  const [updateSessionLocation] = useUpdateSessionLocationMutation();
  const { saveEditedActivity, saveManualActivity, saveTrackedActivity } = createActivitySaveActions({
    dispatch,
    router,
    sendActivity,
    updateActivity,
    uploadRawLocations,
    updateSessionLocation,
    finishedActivity,
    media,
    params,
  });
  const isSaving = isLoading || isUpdating;
  const isSaveDisabled = isSavingDisabled || activeMediaUploadCount > 0;

  const onSave = async () => {
    try {
      if (!userId) return;

      const activityOwnerId = isEditingActivity ? activityId : userId;
      if (!activityOwnerId) return errorToast(ACTIVITY_SAVE_ERROR_COPY.undetectedActivity);

      const distance = Number(manualDistance) || 0;
      const duration = getMillisecondsFromHoursMinutesSeconds(
        Number(manualHours) || 0,
        Number(manualMinutes) || 0,
        Number(manualSeconds) || 0,
      );
      if ((isManualAdding || isEditingActivity) && distance <= 0 && duration <= 0) {
        return errorToast(ACTIVITY_SAVE_BTN[language].noDistanceAndTime);
      }

      dispatch(setSavingDisabled(true));
      if (isEditingActivity) return await saveEditedActivity(activityOwnerId, distance, duration);
      if (isManualAdding) return await saveManualActivity(activityOwnerId, distance, duration);
      return await saveTrackedActivity(activityOwnerId);
    } catch (error) {
      errorToast('', error);
    } finally {
      dispatch(setSavingDisabled(false));
    }
  };

  return { isSaving, isSaveDisabled, isEditingActivity, language, onSave };
}
