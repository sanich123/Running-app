import { setActivityStatus } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { STATUSES } from '@const/enums';
import { View, Text } from 'react-native';
import { TouchableRipple, useTheme } from 'react-native-paper';

import { ACTIVITY_PAUSE_BTN } from './const';

const { paused, continued } = STATUSES;

export default function PauseBtn() {
  const { dark } = useTheme();
  const dispatch = useAppDispatch();
  const { activityStatus } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ language }) => language);

  return (
    <View className="flex flex-row gap-20">
      <TouchableRipple
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        borderless
        style={{ borderRadius: 50 }}
        onPress={() => dispatch(setActivityStatus(activityStatus === paused ? continued : paused))}>
        <View className="flex items-center justify-center bg-red-500 w-28 h-28 rounded-full py-7">
          <Text className="uppercase text-white text-lg">{ACTIVITY_PAUSE_BTN[language].resume}</Text>
        </View>
      </TouchableRipple>
    </View>
  );
}
