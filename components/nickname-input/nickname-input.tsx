import { StyleSheet } from 'react-native';
import { TextInput, Text } from 'react-native-paper';

import { nicknameMatcher } from '../../constants/email-password-regexp';

type NicknameInputProps = {
  nickname: string;
  nicknameError: boolean;
  setNickname: (arg: string) => void;
  setNicknameError: (arg: boolean) => void;
};

export default function NicknameInput({ nickname, nicknameError, setNickname, setNicknameError }: NicknameInputProps) {
  return (
    <>
      {nicknameError && (
        <Text
          variant="titleSmall"
          style={styles.error}>{`Your nickname doesn't match the required pattern: ${nicknameMatcher}`}</Text>
      )}
      <TextInput
        label="Nickname"
        value={nickname}
        onChangeText={(nickname) => setNickname(nickname)}
        onEndEditing={() => (!nicknameMatcher.test(nickname) ? setNicknameError(true) : setNicknameError(false))}
        placeholder="Type your login"
        left={<TextInput.Icon icon="login" />}
        style={{ marginTop: 15 }}
        accessibilityRole="text"
      />
    </>
  );
}

const styles = StyleSheet.create({
  error: {
    color: 'red',
    display: 'flex',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: -15,
  },
});
