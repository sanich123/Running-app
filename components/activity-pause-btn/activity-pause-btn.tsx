import { useContext } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { STATUSES } from '../../constants/enums';
import { LANGUAGE } from '../../constants/languages/languages';
import { useAppSelector } from '../../redux/hooks/hooks';
import { setActivityStatus } from '../../redux/location/location';
import { ActivityComponentContext } from '../../utils/context/activity-component';

const { paused, continued } = STATUSES;

export default function ActivityPauseBtn() {
  const { activityStatus } = useSelector(({ location }) => location);
  const { setIsMapVisible } = useContext(ActivityComponentContext);
  const { language } = useAppSelector(({ language }) => language);
  const dispatch = useDispatch();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 20,
      }}>
      <Pressable
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'red',
          borderRadius: 50,
          width: 90,
          height: 90,
        }}
        onPress={() => {
          dispatch(setActivityStatus(activityStatus === paused ? continued : paused));
          setIsMapVisible(false);
        }}>
        <Text
          style={{
            fontSize: 22,
            textTransform: 'uppercase',
            color: 'white',
          }}>
          {LANGUAGE[language].activity.controlBtns.resume}
        </Text>
      </Pressable>
    </View>
  );
}
