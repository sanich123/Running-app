import { useContext } from 'react';
import { TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { TITLE_PLACEHOLDER, DESCRIPTION_PLACEHOLDER } from './text-inputs-const';
import { saveDescription, saveTitle } from '../../redux/activity/activity';
import { SaveActivityContext } from '../../utils/context/save-activity';

export default function TextInputs() {
  const { setTitle, setDescription, title, description, isDisabled } = useContext(SaveActivityContext);
  const { isDisabledWhileSending } = useSelector(({ activity }) => activity);
  const dispatch = useDispatch();
  return (
    <>
      <TextInput
        mode="outlined"
        value={title}
        onBlur={() => dispatch(saveTitle(title))}
        onChangeText={(title) => {
          setTitle(title);
          dispatch(saveTitle(title));
        }}
        placeholder={TITLE_PLACEHOLDER}
        left={<TextInput.Icon icon="pencil" />}
        style={{ marginTop: 15 }}
        disabled={isDisabled || isDisabledWhileSending}
      />
      <TextInput
        mode="outlined"
        value={description}
        onBlur={() => dispatch(saveDescription(description))}
        onChangeText={(description) => {
          setDescription(description);
          dispatch(saveDescription(description));
        }}
        placeholder={DESCRIPTION_PLACEHOLDER}
        multiline
        numberOfLines={4}
        style={{ minHeight: 150, marginTop: 15 }}
        left={<TextInput.Icon icon="pencil" />}
        disabled={isDisabled || isDisabledWhileSending}
      />
    </>
  );
}
