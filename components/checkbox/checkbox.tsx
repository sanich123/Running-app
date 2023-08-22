import { StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';

type CheckboxProps = {
  isSwitchOn: boolean;
  setIsSwitchOn: (arg: boolean) => void;
};

export default function Checkbox({ isSwitchOn, setIsSwitchOn }: CheckboxProps) {
  return (
    <View style={styles.switcherWrapper}>
      <Switch value={isSwitchOn} onValueChange={() => setIsSwitchOn(!isSwitchOn)} testID="Switcher" />
      <Text variant="titleSmall">Don't publish on Home or Club feeds</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  switcherWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
});
