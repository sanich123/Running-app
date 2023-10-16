import { useEffect, useState } from 'react';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { View, Text } from '../../../components/Themed';
import ActivityComponent from '../../../components/activity-component/activity-component';
import { getExactPosition, getLastKnownPosition } from '../../../utils/get-initial-position';

export default function Activity() {
  const { initialLocation } = useSelector(({ location }) => location);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!initialLocation?.coords) {
      getLastKnownPosition(setIsLoading);
    }
  }, [initialLocation]);

  if (!initialLocation.coords) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Our app is only available, when we have your location</Text>
        <Text>{isLoading ? 'Getting your location...' : null} </Text>
        {!initialLocation?.coords && (
          <Button mode="outlined" onPress={async () => getExactPosition(setIsLoading)}>
            Try manually!
          </Button>
        )}
      </View>
    );
  }
  return <ActivityComponent />;
}
