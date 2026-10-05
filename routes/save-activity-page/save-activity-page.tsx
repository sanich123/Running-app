import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useAppSelector } from '@R/typed-hooks';
import SaveBtn from '@Routes/activity/save-btn/save-btn';
import Checkbox from '@Routes/save-activity-page/checkbox/checkbox';
import DatePickerWeb from '@Routes/save-activity-page/date-picker-web/date-picker-web';
import CameraLauncher from './camera/camera';
import DateTimePicker from './date-picker/date-picker';
import DeclineBtn from './decline-btn/decline-btn';
import EmotionBtns from './emotion-btns/emotion-btns';
import InputsDistanceTime from './inputs-distance-time/inputs-distance-time';
import { useManualActivityParams } from './manual-activity-params';
import MediaSection from './media-section/media-section';
import SportsBtns from './sports-btns/sports-btns';
import TextInputs from './text-inputs/text-inputs';
import { MAX_ACTIVITY_MEDIA } from './upload-photos-btn/ const';
import type { ActivityPhoto } from '@R/slices/activity/types';

export default function SaveResult() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { activityId, isCameraVisible, isManualAdding, isEditingActivity } = useManualActivityParams();
  const { media } = useAppSelector(({ activity }) => activity);
  const [images, setImages] = useState<ActivityPhoto[]>(media);
  const shouldShowActivityDetails = isManualAdding || isEditingActivity;
  const maximumDate = isManualAdding ? new Date() : undefined;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <SaveBtn />,
          headerShown: !isCameraVisible,
          title: '',
        }}
      />
      <View style={styles.page}>
        <KeyboardAwareScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={[styles.content, Platform.OS === 'web' && styles.webContent]}
          keyboardShouldPersistTaps="handled"
          bottomOffset={24}>
          <View style={{ paddingBottom: insets.bottom + 24 }}>
            <TextInputs />
            <SportsBtns />
            <EmotionBtns />
            <Checkbox />
            <MediaSection
              images={images}
              isEditingActivity={isEditingActivity}
              activityId={activityId}
              setImages={setImages}
            />
            {shouldShowActivityDetails && (
              <>
                {Platform.OS === 'web' ? (
                  <DatePickerWeb maximumDate={maximumDate} />
                ) : (
                  <DateTimePicker maximumDate={maximumDate} />
                )}
                <InputsDistanceTime />
              </>
            )}
            <DeclineBtn />
          </View>
        </KeyboardAwareScrollView>
        {isCameraVisible && (
          <View style={styles.cameraOverlay}>
            <CameraLauncher photos={images} setPhotos={setImages} maxPhotos={MAX_ACTIVITY_MEDIA} />
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
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
  cameraOverlay: {
    bottom: 0,
    elevation: 20,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
});
