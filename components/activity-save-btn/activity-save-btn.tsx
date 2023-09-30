import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { setIsNeedToSaveActivity } from '../../redux/activity/activity';

export default function ActivitySaveBtn() {
  const { colors } = useTheme();
  const router = useRouter();
  const { finishedActivity } = useSelector(({ location }) => location);
  const { isNeedToSave, savedActivity } = useSelector(({ activity }) => activity);
  const dispatch = useDispatch();
  return (
    <Pressable onPress={() => dispatch(setIsNeedToSaveActivity(true))}>
      <Text variant="titleMedium" style={{ color: colors.primaryContainer, marginRight: 15 }}>
        Save
      </Text>
    </Pressable>
  );
}
