import { setActivityStatus } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { STATUSES } from '@const/enums';
import { View, Text, Pressable } from 'react-native';

import { ACTIVITY_PAUSE_BTN } from './const';

const { paused, continued } = STATUSES;

export default function ActivityPauseBtn() {
  const dispatch = useAppDispatch();
  const { activityStatus } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ language }) => language);

  return (
    <View className="flex flex-row gap-20">
      <Pressable
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        onPress={() => dispatch(setActivityStatus(activityStatus === paused ? continued : paused))}>
        <View className="flex items-center justify-center bg-red-500 w-28 h-28 rounded-full py-7">
          <Text className="uppercase text-white text-lg">{ACTIVITY_PAUSE_BTN[language].resume}</Text>
        </View>
      </Pressable>
    </View>
  );
}
