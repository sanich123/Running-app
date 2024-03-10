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
  setManualDate,
  setManualDistance,
  setManualHours,
  setManualMinutes,
} from '@R/activity/activity';
import { useGetActivityByActivityIdQuery } from '@R/runich-api/runich-api';
import { useAppDispatch } from '@R/typed-hooks';
import { getHoursMinutesFromMilliseconds } from '@U/time-formatter';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

export default function ActivityUpdateBtn() {
  const theme = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const { id: activityId } = useLocalSearchParams();
  const { data: activity } = useGetActivityByActivityIdQuery(`${activityId}`);

  return (
    <Pressable
      onPress={() => {
        dispatch(setIsEditingActivity(true));
        dispatch(resetFinishedActivity());
        dispatch(resetManualData());
        dispatch(resetActivityInfo());
        dispatch(saveTitle(activity?.title));
        dispatch(saveDescription(activity?.description));
        dispatch(saveSport(activity?.sport));
        dispatch(saveEmotion(activity?.emotion));
        dispatch(saveIsPublic(activity?.isPublic));
        dispatch(addPhotoUrls(activity?.photoVideoUrls));
        dispatch(saveSport(activity?.sport));
        dispatch(setManualDate(new Date(activity?.date)));
        dispatch(setManualDistance(activity?.distance / 1000));
        dispatch(setManualHours(getHoursMinutesFromMilliseconds(activity?.duration).hours));
        dispatch(setManualMinutes(getHoursMinutesFromMilliseconds(activity?.duration).minutes));
        //@ts-ignore
        push(`/(tabs)/${place}/manual-activity/?activityId=${activityId}`);
      }}>
      <Text variant="titleMedium" style={{ color: theme.colors.primaryContainer, marginRight: 15 }}>
        Edit
      </Text>
    </Pressable>
  );
}
