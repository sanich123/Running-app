import { useContext } from 'react';
import { TextInput } from 'react-native-paper';

import { TITLE_PLACEHOLDER, DESCRIPTION_PLACEHOLDER } from './text-inputs-const';
import { SaveActivityContext } from '../../utils/context/save-activity';

export default function TextInputs() {
  const { setTitle, setDescription, title, description } = useContext(SaveActivityContext);
  return (
    <>
      <TextInput
        mode="outlined"
        value={title}
        onChangeText={(title) => setTitle(title)}
        placeholder={TITLE_PLACEHOLDER}
        left={<TextInput.Icon icon="pencil" />}
        style={{ marginTop: 15 }}
      />
      <TextInput
        mode="outlined"
        value={description}
        onChangeText={(description) => setDescription(description)}
        placeholder={DESCRIPTION_PLACEHOLDER}
        multiline
        style={{ minHeight: 150, marginTop: 15 }}
        left={<TextInput.Icon icon="pencil" />}
      />
    </>
  );
}
