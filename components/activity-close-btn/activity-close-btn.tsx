import { useRouter } from 'expo-router';
import { Alert, Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { STATUSES } from '../../constants/enums';
import { resetLastKm, resetLocationsFromBackground, setActivityStatus } from '../../redux/location/location';

export default function ActivityCloseBtn() {
  const router = useRouter();
  const { colors } = useTheme();
  const { duration } = useSelector(({ location }) => location);
  const dispatch = useDispatch();

  async function closeBtnHandler() {
    dispatch(setActivityStatus(STATUSES.initial));
    dispatch(resetLocationsFromBackground());
    dispatch(resetLastKm());
    router.back();
  }
  return (
    <Pressable
      onPress={() => {
        if (duration > 0) {
          Alert.alert(
            'Deleting activity',
            'Are you sure?',
            [
              {
                text: 'Yes, I am sure',
                onPress: closeBtnHandler,
                style: 'cancel',
              },
            ],
            {
              cancelable: true,
            },
          );
        } else {
          closeBtnHandler();
        }
      }}>
      <Text variant="titleMedium" style={{ color: colors.primaryContainer, marginLeft: 15 }}>
        Close
      </Text>
    </Pressable>
  );
}
