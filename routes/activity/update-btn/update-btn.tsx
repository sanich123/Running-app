import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useTheme, Text, TouchableRipple } from 'react-native-paper';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import {
  addPhotoUrls,
  resetAdditionaInfoActivitySlice,
  saveDescription,
  saveEmotion,
  saveIsPublic,
  saveSport,
  saveTitle,
} from '@R/slices/actitivity-additional-info/activity-additional-info';
import { resetFinishedActivity, setActivityId } from '@R/slices/activity/activity';
import {
  resetManualActivitySlice,
  setIsEditingActivity,
  setManualDate,
  setManualDistance,
  setManualHours,
  setManualMinutes,
} from '@R/slices/manual-activity/manual-activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ACTIVITY_SAVE_BTN } from '@Routes/activity/save-btn/const';
import { errorToast } from '@S/error-toast/error-toast';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';

export default function UpdateBtn() {
  const { colors, dark } = useTheme();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { id: activityId } = useGlobalSearchParams();
  const { data: activity, error, isError, isLoading } = useGetActivityByActivityIdQuery(`${activityId}`);
  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={{ padding: 5, borderRadius: 10, opacity: isLoading || isError ? 0.5 : 1 }}
      disabled={isError || isLoading}
      onPress={() => {
        if (activity) {
          dispatch(resetFinishedActivity());
          dispatch(resetManualActivitySlice());
          dispatch(resetAdditionaInfoActivitySlice());

          dispatch(setIsEditingActivity(true));
          dispatch(setActivityId(activity.id));
          dispatch(saveTitle(activity?.title));
          dispatch(saveDescription(activity?.description));
          dispatch(saveSport(activity?.sport));
          dispatch(saveEmotion(activity?.emotion));
          dispatch(saveIsPublic(activity?.isPublic));
          if (activity?.photoVideoUrls) {
            dispatch(addPhotoUrls(activity?.photoVideoUrls));
          }
          dispatch(saveSport(activity?.sport));
          dispatch(setManualDate(new Date(activity?.date)));
          dispatch(setManualDistance(activity?.distance / 1000));
          dispatch(setManualHours(getHoursMinutesFromMilliseconds(activity?.duration).hours));
          dispatch(setManualMinutes(getHoursMinutesFromMilliseconds(activity?.duration).minutes));
          push(`/(protected)/manual-activity`);
        } else {
          errorToast('Не удалось загрузить данные об активности', error);
        }
      }}>
      <Text variant="titleMedium" style={{ color: colors.onSurfaceVariant, marginRight: 15 }}>
        {ACTIVITY_SAVE_BTN[language].edit}
      </Text>
    </TouchableRipple>
  );
}
