import { useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { saveDescription, saveTitle } from '../../redux/activity/activity';

export default function TextInputs({ isDisabled }: { isDisabled: boolean }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const dispatch = useDispatch();
  const { isDisabledWhileSending, isNeedToResetInputs } = useSelector(({ activity }) => activity);

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
        placeholder="Title your run"
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
        placeholder="How'd it go? Share more about your activity"
        multiline
        numberOfLines={4}
        style={{ minHeight: 150, marginTop: 15 }}
        left={<TextInput.Icon icon="pencil" />}
        disabled={isDisabled || isDisabledWhileSending}
      />
    </>
  );
}
