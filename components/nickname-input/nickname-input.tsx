import { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Text } from 'react-native-paper';

import { nicknameMatcher } from '../../constants/email-password-regexp';
import { SignInContext } from '../../utils/context/sign-in';

export default function NicknameInput() {
  const { nickname, nicknameError, setNickname, setNicknameError } = useContext(SignInContext);
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
