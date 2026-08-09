import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { setCameraIsVisible } from '@R/slices/manual-activity/manual-activity';
import { useAppDispatch } from '@R/typed-hooks';

export default function CloseBtn() {
  const dispatch = useAppDispatch();

  return (
    <IconButton
      icon="close"
      mode="contained-tonal"
      size={24}
      iconColor="#fff"
      containerColor="rgba(0, 0, 0, 0.45)"
      style={styles.button}
      onPress={() => dispatch(setCameraIsVisible(false))}
      testID="CloseBtn"
      accessibilityLabel="Закрыть камеру"
    />
  );
}

const styles = StyleSheet.create({
  button: { margin: 0 },
});
