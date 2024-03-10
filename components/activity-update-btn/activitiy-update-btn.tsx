import {
  resetFinishedActivity,
  resetManualData,
  saveDescription,
  saveIsPublic,
  saveSport,
  saveTitle,
  setIsManualAdding,
} from '@R/activity/activity';
import { useGetActivityByActivityIdQuery } from '@R/runich-api/runich-api';
import { useAppDispatch } from '@R/typed-hooks';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

export default function ActivityUpdateBtn() {
  const theme = useTheme();
  const { push } = useRouter();
  // const pathname = usePathname();
  const dispatch = useAppDispatch();
  // const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const { id: activityId } = useLocalSearchParams();
  const { data: activity } = useGetActivityByActivityIdQuery(`${activityId}`);
  console.log(activity);

  return (
    <Pressable
      onPress={() => {
        dispatch(setIsManualAdding(true));
        dispatch(resetFinishedActivity());
        dispatch(resetManualData());
        dispatch(saveTitle(activity?.title));
        dispatch(saveDescription(activity?.description));
        dispatch(saveSport(activity?.sport));
        dispatch(saveIsPublic(activity?.isPublic));
        push(`/(tabs)/home/manual-activity/`);
      }}>
      <Text variant="titleMedium" style={{ color: theme.colors.primaryContainer, marginRight: 15 }}>
        Edit
      </Text>
    </Pressable>
  );
}
