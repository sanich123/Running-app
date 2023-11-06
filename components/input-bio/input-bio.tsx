import { TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';

type InputBioProps = {
  bio: string;
  setBio: (arg: string) => void;
  isDisabled: boolean;
};

export default function InputBio({ bio, setBio, isDisabled }: InputBioProps) {
  const { isDisabledWhileSendingProfile } = useSelector(({ profile }) => profile);
  return (
    <TextInput
      testID="inputBio"
      mode="outlined"
      style={{ width: 365 }}
      label="Bio"
      placeholder="Type a few words about yourself"
      multiline
      numberOfLines={4}
      value={bio}
      onChangeText={(bio) => setBio(bio)}
      disabled={isDisabled || isDisabledWhileSendingProfile}
    />
  );
}
