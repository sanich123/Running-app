import { useState } from 'react';
import { TextInput, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { saveDescription, saveTitle } from '@R/slices/activity-additional-info/activity-additional-info';
import { store } from '@R/store';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import {
  TEXT_INPUTS,
  TEXT_INPUTS_TITLE_LEFT_ICON,
  TEXT_INPUTS_DESCRIPTION_LEFT_ICON,
  TEXT_INPUTS_TITLE_TEST_ID,
  TEXT_INPUTS_DESCRIPTION_TEST_ID,
} from './const';

export default function TextInputs({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  const [title, setTitle] = useState(store.getState().additionalInfoActivity.title);
  const [description, setDescription] = useState(store.getState().additionalInfoActivity.description);
  const shouldBeDisabled = isDisabled || isDisabledWhileSending;

  return (
    <>
      <TextInput
        testID={TEXT_INPUTS_TITLE_TEST_ID}
        mode="outlined"
        value={title}
        onBlur={() => dispatch(saveTitle(title))}
        onChangeText={(title) => {
          setTitle(title);
          dispatch(saveTitle(title));
        }}
        placeholder={TEXT_INPUTS[language].titlePlaceholder}
        left={<TextInput.Icon icon="format-title" testID={TEXT_INPUTS_TITLE_LEFT_ICON} />}
        style={{
          marginTop: 12,
          backgroundColor: colors.surface,
          fontSize: 15,
          minHeight: 52,
          opacity: shouldBeDisabled ? 0.7 : 1,
        }}
        contentStyle={{ fontFamily: FONT_FAMILIES.regular }}
        outlineStyle={{ borderRadius: 8 }}
        outlineColor={colors.outlineVariant}
        activeOutlineColor={colors.primary}
        textColor={colors.onSurface}
        disabled={shouldBeDisabled}
      />
      <TextInput
        testID={TEXT_INPUTS_DESCRIPTION_TEST_ID}
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
        style={{
          minHeight: 96,
          marginTop: 12,
          backgroundColor: colors.surface,
          fontSize: 15,
          opacity: shouldBeDisabled ? 0.7 : 1,
        }}
        contentStyle={{ fontFamily: FONT_FAMILIES.regular }}
        outlineStyle={{ borderRadius: 8 }}
        outlineColor={colors.outlineVariant}
        activeOutlineColor={colors.primary}
        textColor={colors.onSurface}
        left={<TextInput.Icon icon="text-box-outline" testID={TEXT_INPUTS_DESCRIPTION_LEFT_ICON} />}
        disabled={shouldBeDisabled}
      />
    </>
  );
}
