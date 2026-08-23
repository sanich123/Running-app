import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import Checkbox from '@Routes/save-activity-page/checkbox/checkbox';
import DatePickerWeb from '@Routes/save-activity-page/date-picker-web/date-picker-web';
import DateTimePicker from './date-picker/date-picker';
import DeclineBtn from './decline-btn/decline-btn';
import EmotionBtns from './emotion-btns/emotion-btns';
import InputsDistanceTime from './inputs-distance-time/inputs-distance-time';
import { useManualActivityParams } from './manual-activity-params';
import SportsBtns from './sports-btns/sports-btns';
import TextInputs from './text-inputs/text-inputs';

export default function SaveResult() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isManualAdding, isEditingActivity } = useManualActivityParams();
  const isDisabled = false;

  return (
    <KeyboardAwareScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, Platform.OS === 'web' && styles.webContent]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}>
      <View style={{ paddingBottom: insets.bottom + 24 }}>
        <TextInputs isDisabled={isDisabled} />
        <SportsBtns isDisabled={isDisabled} />
        <EmotionBtns isDisabled={isDisabled} />
        <Checkbox isDisabled={isDisabled} />
        {(isManualAdding || isEditingActivity) && Platform.OS !== 'web' && <DateTimePicker isDisabled={isDisabled} />}
        {(isManualAdding || isEditingActivity) && Platform.OS === 'web' && <DatePickerWeb isDisabled={isDisabled} />}
        {(isManualAdding || isEditingActivity) && <InputsDistanceTime isDisabled={isDisabled} />}
        <DeclineBtn isDisabled={isDisabled} />
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 10,
  },
  webContent: {
    marginHorizontal: 'auto',
    maxWidth: MAX_MOBILE_WIDTH,
    width: '100%',
  },
});
