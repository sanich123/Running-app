import { TextInput } from 'react-native-paper';

import { TITLE_PLACEHOLDER, DESCRIPTION_PLACEHOLDER } from './text-inputs-const';

type TextInputsProps = {
  setTitle: (arg: string) => void;
  setDescription: (arg: string) => void;
  title: string;
  description: string;
};

export default function TextInputs({ setTitle, setDescription, title, description }: TextInputsProps) {
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
