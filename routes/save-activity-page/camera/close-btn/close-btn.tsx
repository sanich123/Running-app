import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useSetManualActivityParams } from '../../manual-activity-params';

export default function CloseBtn() {
  const { setCameraIsVisible } = useSetManualActivityParams();

  return (
    <IconButton
      icon="close"
      mode="contained-tonal"
      size={24}
      iconColor="#fff"
      containerColor="rgba(0, 0, 0, 0.45)"
      style={styles.button}
      onPress={() => setCameraIsVisible(false)}
      testID="CloseBtn"
      accessibilityLabel="Закрыть камеру"
    />
  );
}

const styles = StyleSheet.create({
  button: { margin: 0 },
});
