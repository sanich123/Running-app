import { View, Text } from '@c/Themed';
import ActivityComponent from '@c/activity-component/activity-component';
import { setInitialLocation } from '@r/location-slice/location-slice';
import { getCurrentPositionAsync } from 'expo-location';
import { ToastAndroid } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

export default function Activity() {
  const dispatch = useDispatch();
  const { initialLocation } = useSelector(({ location }) => location);
  if (!initialLocation.coords) {
    return (
      <View>
        <Text>Our app is only available, when we have your location</Text>
        <Button
          mode="outlined"
          onPress={async () => {
            const currentPosition = await getCurrentPositionAsync();
            ToastAndroid.show(`Position from activity component ${currentPosition.toString()}`, ToastAndroid.SHORT);
            if (currentPosition) {
              dispatch(setInitialLocation(currentPosition));
            }
          }}>
          Get fucking location!
        </Button>
      </View>
    );
  } else {
    return <ActivityComponent />;
  }
}
