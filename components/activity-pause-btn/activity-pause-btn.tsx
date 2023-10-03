import { useContext } from 'react';
import { View, Text, Pressable } from 'react-native';

import { STATUSES } from '../../constants/enums';
import { LANGUAGE } from '../../constants/languages/languages';
import { useAppSelector } from '../../redux/hooks/hooks';
import { ActivityComponentContext } from '../../utils/context/activity-component';

const { paused, continued } = STATUSES;

export default function ActivityPauseBtn() {
  const { status, setStatus, setIsMapVisible } = useContext(ActivityComponentContext);
  const { language } = useAppSelector(({ language }) => language);
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
          setStatus(status === paused ? continued : paused);
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
