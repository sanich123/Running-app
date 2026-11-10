import { StyleSheet } from 'react-native';
import { useTheme, Text, Button } from 'react-native-paper';
import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from '@const/activity-save-btn';
import { useSaveActivity } from './use-save-activity';

export default function SaveBtn() {
  const { colors } = useTheme();
  const { isSaving, isSaveDisabled, isEditingActivity, language, onSave } = useSaveActivity();
  const textOnBtn = isEditingActivity ? ACTIVITY_SAVE_BTN[language].update : ACTIVITY_SAVE_BTN[language].save;

  return (
    <Button
      style={styles.layout}
      testID={ACTIVITY_SAVE_BTN_TEST_ID}
      loading={isSaving}
      onPress={onSave}
      disabled={isSaveDisabled}>
      {!isSaving ? (
        <Text variant="titleMedium" style={{ color: colors.onSurfaceVariant }}>
          {textOnBtn}
        </Text>
      ) : null}
    </Button>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderRadius: 10,
  },
});
