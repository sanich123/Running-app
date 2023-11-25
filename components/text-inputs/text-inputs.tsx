import { saveTitle, saveDescription } from '@R/activity/activity';
import { store } from '@R/store';
import { useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { TEXT_INPUTS, TEXT_INPUTS_TITLE_LEFT_ICON, TEXT_INPUTS_DESCRIPTION_LEFT_ICON } from './const';

export default function TextInputs({ isDisabled }: { isDisabled: boolean }) {
  const { isDisabledWhileSending, isNeedToResetInputs } = useSelector(({ activity }) => activity);
  const [title, setTitle] = useState(store.getState().activity.additionalInfo.title);
  const [description, setDescription] = useState(store.getState().activity.additionalInfo.description);
  const dispatch = useDispatch();

  const { language } = useSelector(({ language }) => language);

  useEffect(() => {
    if (isNeedToResetInputs) {
      setTitle('');
      dispatch(saveTitle(''));
      setDescription('');
      dispatch(saveDescription(''));
    }
  }, [isNeedToResetInputs]);

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
        placeholder={TEXT_INPUTS[language as keyof typeof TEXT_INPUTS].titlePlaceholder}
        left={<TextInput.Icon icon="pencil" testID={TEXT_INPUTS_TITLE_LEFT_ICON} />}
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
        placeholder={TEXT_INPUTS[language as keyof typeof TEXT_INPUTS].descriptionPlaceholder}
        multiline
        numberOfLines={4}
        style={{ minHeight: 150, marginTop: 15 }}
        left={<TextInput.Icon icon="pencil" testID={TEXT_INPUTS_DESCRIPTION_LEFT_ICON} />}
        disabled={isDisabled || isDisabledWhileSending}
      />
    </>
  );
}
