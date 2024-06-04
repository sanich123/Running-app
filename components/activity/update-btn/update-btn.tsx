import { ACTIVITY_SAVE_BTN } from '@C/activity/save-btn/const';
import {
  addPhotoUrls,
  resetActivityInfo,
  resetFinishedActivity,
  resetManualData,
  saveDescription,
  saveEmotion,
  saveIsPublic,
  saveSport,
  saveTitle,
  setIsEditingActivity,
  setIsManualAdding,
  setManualDate,
  setManualDistance,
  setManualHours,
  setManualMinutes,
} from '@R/activity/activity';
import { useGetActivityByActivityIdQuery } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useTheme, Text, TouchableRipple } from 'react-native-paper';

export default function UpdateBtn() {
  const { colors, dark } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const { id: activityId } = useLocalSearchParams();
  const { data: activity, isError, isLoading } = useGetActivityByActivityIdQuery(`${activityId}`);

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={{ padding: 5, borderRadius: 10, opacity: isLoading || isError ? 0.5 : 1 }}
      disabled={isError || isLoading}
      onPress={() => {
        if (activity) {
          dispatch(setIsManualAdding(false));
          dispatch(setIsEditingActivity(true));
          dispatch(resetFinishedActivity());
          dispatch(resetManualData());
          dispatch(resetActivityInfo());
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
          //@ts-ignore
          push(`/(tabs)/${place}/manual-activity/?activityId=${activityId}`);
        } else {
          showCrossPlatformToast('Не удалось загрузить данные об активности!');
        }
      }}>
      <Text variant="titleMedium" style={{ color: colors.onSurfaceVariant, marginRight: 15 }}>
        {ACTIVITY_SAVE_BTN[language].edit}
      </Text>
    </TouchableRipple>
  );
}
