import { ToastAndroid } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';

import { useDeleteActivityByIdMutation } from '../../redux/runnich-api/runnich-api';

export default function ActivityCardDeleteBtn({ activityId }: { activityId: string }) {
  const [deleteActivityById] = useDeleteActivityByIdMutation();
  return (
    <IconButton
      icon="delete"
      iconColor={MD3Colors.error50}
      size={20}
      onPress={async () => {
        await deleteActivityById(activityId)
          .unwrap()
          .then((success) => console.log(success))
          .catch((error) => console.log(error));
        ToastAndroid.show('Successfully delete an activity', ToastAndroid.SHORT);
      }}
    />
  );
}
