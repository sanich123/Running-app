import { useContext } from 'react';
import { TextInput } from 'react-native-paper';

import { nicknameMatcher } from '../../constants/email-password-regexp';
import { SignInContext } from '../../utils/context/sign-in';

export default function NicknameInput() {
  const { nickname, nicknameError, setNickname, setNicknameError } = useContext(SignInContext);
  return (
    <>
      <TextInput
        label={nicknameError ? `Must be at least 2 symbols` : 'Nickname'}
        value={nickname}
        onChangeText={(nickname) => setNickname(nickname)}
        onEndEditing={() => (!nicknameMatcher.test(nickname) ? setNicknameError(true) : setNicknameError(false))}
        placeholder="Type your login"
        left={<TextInput.Icon icon="login" />}
        style={{ marginTop: 15 }}
        accessibilityRole="text"
        mode="outlined"
      />
    </>
  );
}
