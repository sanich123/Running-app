import { useAppSelector } from '@R/typed-hooks';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

import { NAME_SURNAME, NAME_TEST_ID, SURNAME_TEST_ID } from './const';

type InputsNameSurnameProps = {
  name: string;
  surname: string;
  setName: (arg: string) => void;
  setSurname: (arg: string) => void;
  isDisabled: boolean;
};

export default function InputsNameSurname({ name, surname, setName, setSurname, isDisabled }: InputsNameSurnameProps) {
  const { isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        testID={NAME_TEST_ID}
        mode="outlined"
        style={{ width: '50%' }}
        label={NAME_SURNAME[language].nameLabel}
        placeholder={NAME_SURNAME[language].namePlaceholder}
        value={name}
        onChangeText={(name) => setName(name)}
        disabled={isDisabled || isDisabledWhileSendingProfile}
      />
      <TextInput
        testID={SURNAME_TEST_ID}
        mode="outlined"
        style={{ width: '50%' }}
        label={NAME_SURNAME[language].surnameLabel}
        placeholder={NAME_SURNAME[language].surnamePlaceholder}
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
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: 15,
    marginRight: 15,
  },
});
