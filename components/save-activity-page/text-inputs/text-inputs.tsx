import { saveTitle, saveDescription } from '@R/activity/activity';
import { store } from '@R/store';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useState } from 'react';
import { TextInput } from 'react-native-paper';

import { TEXT_INPUTS, TEXT_INPUTS_TITLE_LEFT_ICON, TEXT_INPUTS_DESCRIPTION_LEFT_ICON } from './const';

export default function TextInputs({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ language }) => language);
  const [title, setTitle] = useState(store.getState().activity.additionalInfo.title);
  const [description, setDescription] = useState(store.getState().activity.additionalInfo.description);

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
        placeholder={TEXT_INPUTS[language].titlePlaceholder}
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
        placeholder={TEXT_INPUTS[language].descriptionPlaceholder}
        multiline
        numberOfLines={4}
        style={{ minHeight: 150, marginTop: 15 }}
        left={<TextInput.Icon icon="pencil" testID={TEXT_INPUTS_DESCRIPTION_LEFT_ICON} />}
        disabled={isDisabled || isDisabledWhileSending}
      />
    </>
  );
}
