import { StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { ACTIVITY_INPUT_LIMITS } from '@const/input-limits';
import { useAppSelector } from '@R/typed-hooks';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import {
  TEXT_INPUTS,
  TEXT_INPUTS_TITLE_LEFT_ICON,
  TEXT_INPUTS_DESCRIPTION_LEFT_ICON,
  TEXT_INPUTS_TITLE_TEST_ID,
  TEXT_INPUTS_DESCRIPTION_TEST_ID,
} from './const';

export default function TextInputs() {
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const { title, description } = useManualActivityParams();
  const { setTitle, setDescription } = useSetManualActivityParams();
  const shouldBeDisabled = isSavingDisabled;

  return (
    <>
      <TextInput
        testID={TEXT_INPUTS_TITLE_TEST_ID}
        mode="outlined"
        value={title}
        onChangeText={setTitle}
        placeholder={TEXT_INPUTS[language].titlePlaceholder}
        maxLength={ACTIVITY_INPUT_LIMITS.title}
        right={<TextInput.Affix text={`${title.length}/${ACTIVITY_INPUT_LIMITS.title}`} />}
        left={<TextInput.Icon icon="format-title" testID={TEXT_INPUTS_TITLE_LEFT_ICON} />}
        style={[
          styles.input,
          styles.titleInput,
          { backgroundColor: colors.surface },
          shouldBeDisabled && styles.disabledInput,
        ]}
        contentStyle={[styles.content, styles.titleContent]}
        outlineStyle={styles.outline}
        outlineColor={colors.outlineVariant}
        activeOutlineColor={colors.primary}
        textColor={colors.onSurface}
        disabled={shouldBeDisabled}
      />
      <TextInput
        testID={TEXT_INPUTS_DESCRIPTION_TEST_ID}
        mode="outlined"
        value={description}
        onChangeText={setDescription}
        placeholder={TEXT_INPUTS[language].descriptionPlaceholder}
        maxLength={ACTIVITY_INPUT_LIMITS.description}
        right={<TextInput.Affix text={`${description.length}/${ACTIVITY_INPUT_LIMITS.description}`} />}
        multiline
        numberOfLines={4}
        style={[
          styles.input,
          styles.descriptionInput,
          { backgroundColor: colors.surface },
          shouldBeDisabled && styles.disabledInput,
        ]}
        contentStyle={[styles.content, styles.descriptionContent]}
        outlineStyle={styles.outline}
        outlineColor={colors.outlineVariant}
        activeOutlineColor={colors.primary}
        textColor={colors.onSurface}
        left={<TextInput.Icon icon="text-box-outline" testID={TEXT_INPUTS_DESCRIPTION_LEFT_ICON} />}
        disabled={shouldBeDisabled}
      />
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 8,
    fontSize: 15,
    marginTop: 12,
    width: '100%',
  },
  titleInput: {
    height: 52,
  },
  descriptionInput: {
    height: 96,
  },
  content: {
    fontFamily: FONT_FAMILIES.regular,
    paddingHorizontal: 0,
  },
  titleContent: {
    height: 52,
    paddingVertical: 0,
    textAlignVertical: 'center' as const,
  },
  descriptionContent: {
    minHeight: 94,
    paddingBottom: 12,
    paddingTop: 12,
    textAlignVertical: 'top' as const,
  },
  outline: {
    borderRadius: 8,
  },
  disabledInput: {
    opacity: 0.7,
  },
});
