import { getCurrentPositionAsync } from 'expo-location';
import { ToastAndroid } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { View, Text } from '../../../components/Themed';
import ActivityComponent from '../../../components/activity-component/activity-component';
import { setInitialLocation } from '../../../redux/location/location';

export default function Activity() {
  const dispatch = useDispatch();
  const { initialLocation } = useSelector(({ location }) => location);
  if (!initialLocation.coords) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Our app is only available, when we have your location</Text>
        <Button
          mode="outlined"
          onPress={async () => {
            const currentPosition = await getCurrentPositionAsync();
            ToastAndroid.show(`Got position ${currentPosition.toString()}`, ToastAndroid.SHORT);
            if (currentPosition) {
              dispatch(setInitialLocation(currentPosition));
            }
          }}>
          Get fucking location!
        </Button>
      </View>
    );
  }
  return <ActivityComponent />;
}
