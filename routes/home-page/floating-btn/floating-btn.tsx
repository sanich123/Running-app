import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { getFloatingButtonPosition } from './const';

export default function FloatingBtn({ onPressFn }: { onPressFn: (arg: any) => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const overlapsTabBar = Platform.OS === 'ios';

  return (
    <FAB
      testID="floatingBtn"
      icon="plus"
      style={[styles.button, getFloatingButtonPosition({ width, insets, overlapsTabBar })]}
      onPress={onPressFn}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
  },
});
