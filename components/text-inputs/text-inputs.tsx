import { useContext } from 'react';
import { TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { TITLE_PLACEHOLDER, DESCRIPTION_PLACEHOLDER } from './text-inputs-const';
import { saveDescription, saveTitle } from '../../redux/activity/activity';
import { SaveActivityContext } from '../../utils/context/save-activity';

export default function TextInputs() {
  const { setTitle, setDescription, title, description, isDisabled } = useContext(SaveActivityContext);
  const dispatch = useDispatch();
  return (
    <>
      <TextInput
        mode="outlined"
        value={title}
        onBlur={() => dispatch(saveTitle(title))}
        onChangeText={(title) => setTitle(title)}
        placeholder={TITLE_PLACEHOLDER}
        left={<TextInput.Icon icon="pencil" />}
        style={{ marginTop: 15 }}
        disabled={isDisabled}
      />
      <TextInput
        mode="outlined"
        value={description}
        onBlur={() => dispatch(saveDescription(description))}
        onChangeText={(description) => setDescription(description)}
        placeholder={DESCRIPTION_PLACEHOLDER}
        multiline
        numberOfLines={4}
        style={{ minHeight: 150, marginTop: 15 }}
        left={<TextInput.Icon icon="pencil" />}
        disabled={isDisabled}
      />
    </>
  );
}
