import { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { SaveSettingsContext } from '../../utils/context/settings';

export default function InputsNameSurname() {
  const { name, surname, setName, setSurname, isDisabled } = useContext(SaveSettingsContext);
  const { isDisabledWhileSendingProfile } = useSelector(({ profile }) => profile);
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        mode="outlined"
        style={{ width: 170 }}
        label="First Name"
        placeholder="Type your name"
        value={name}
        onChangeText={(name) => setName(name)}
        disabled={isDisabled || isDisabledWhileSendingProfile}
      />
      <TextInput
        mode="outlined"
        style={{ width: 170 }}
        label="Last Name"
        placeholder="Type your surname"
        value={surname}
        onChangeText={(surname) => setSurname(surname)}
        disabled={isDisabled || isDisabledWhileSendingProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
});
