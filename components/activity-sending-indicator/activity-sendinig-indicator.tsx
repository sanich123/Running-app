import { View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { setIsNeedToSendActivity } from '../../redux/activity/activity';

export default function ActivitySendingIndicator({
  isErrorSending,
  isStartSending,
}: {
  isErrorSending: boolean;
  isStartSending: boolean;
}) {
  const dispatch = useDispatch();
  return (
    <Pressable
      onPress={() => {
        if (isErrorSending) {
          dispatch(setIsNeedToSendActivity(true));
        }
      }}>
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 30,
          backgroundColor: !isErrorSending ? 'green' : 'red',
        }}>
        <Text variant="bodyMedium">
          {isStartSending ? 'Sending an activity' : 'An error occured, try to refetch manually'}
        </Text>
      </View>
    </Pressable>
  );
}
