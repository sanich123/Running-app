import { useContext } from 'react';
import { HelperText, TextInput } from 'react-native-paper';

import { nicknameMatcher } from '../../constants/regexp';
import { SignInContext } from '../../utils/context/sign-in';

export default function NicknameInput() {
  const { nickname, nicknameError, setNickname, setNicknameError } = useContext(SignInContext);
  return (
    <>
      <TextInput
        label="Nickname"
        value={nickname}
        onChangeText={(nickname) => setNickname(nickname)}
        onEndEditing={() => (!nicknameMatcher.test(nickname) ? setNicknameError(true) : setNicknameError(false))}
        placeholder="Type your login"
        left={<TextInput.Icon icon="login" />}
        style={{ marginTop: 10 }}
        accessibilityRole="text"
        mode="outlined"
      />
      <HelperText type="error" visible={nicknameError} padding="none">
        Must be at least 2 symbols
      </HelperText>
    </>
  );
}
