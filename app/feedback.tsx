import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import uuid from 'react-native-uuid';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, RadioButton, Text, TextInput, useTheme } from 'react-native-paper';
import { useSendFeedbackMutation } from '@R/services/feedback/feedback';
import { useAppSelector } from '@R/typed-hooks';
import { FEEDBACK_TEXT } from '@Routes/feedback/const';
import { errorToast } from '@S/error-toast/error-toast';
import SwitchRow from '@S/feedback/switch-row';
import { deviceMetadata, deviceName, platform } from '@U/device/device-id';
import { getAccessToGallery } from '@U/file-sending';
import { uploadFeedbackAttachment } from './utils';
import type { FeedbackKind } from '@Routes/feedback/const';
import type * as ImagePicker from 'expo-image-picker';

export default function FeedbackPage() {
  const { colors } = useTheme();
  const { back } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = FEEDBACK_TEXT[language];
  const [kind, setKind] = useState<FeedbackKind | null>(null);
  const [firstConsent, setFirstConsent] = useState(false);
  const [secondConsent, setSecondConsent] = useState(false);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [feedbackId] = useState(() => String(uuid.v4()));
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [sendFeedback, { isLoading }] = useSendFeedbackMutation();

  const isBug = kind === 'bug';
  const isFeature = kind === 'feature';
  const canWrite = kind === 'thanks' || (isBug && secondConsent) || (isFeature && secondConsent);

  async function choosePhoto() {
    try {
      const result = await getAccessToGallery(['images', 'videos']);
      if (result && !result.canceled) setPhoto(result.assets[0]);
    } catch (error) {
      errorToast(copy.openGalleryError, error);
    }
  }

  async function submit() {
    if (!kind || !text.trim() || !canWrite) return;
    try {
      setIsUploadingPhoto(Boolean(photo));
      const attachment = photo ? await uploadFeedbackAttachment(photo.file ?? photo.uri, feedbackId) : undefined;
      if (photo && !attachment) return;

      await sendFeedback({
        feedbackId,
        kind,
        text: text.trim(),
        deviceInfo: JSON.stringify({ platform, deviceName, ...deviceMetadata }),
        ...(attachment ? { attachments: [attachment] } : {}),
      }).unwrap();
      back();
    } catch (error) {
      errorToast(copy.submitError, error);
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.content}
      style={{ backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}>
      <Card mode="contained" style={{ backgroundColor: colors.surface }}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleLarge">{copy.title}</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            {copy.intro}
          </Text>
          <RadioButton.Group
            onValueChange={(value) => {
              setKind(value as FeedbackKind);
              setFirstConsent(false);
              setSecondConsent(false);
            }}
            value={kind ?? ''}>
            <RadioButton.Item label={copy.bug} value="bug" />
            <RadioButton.Item label={copy.thanks} value="thanks" />
            <RadioButton.Item label={copy.feature} value="feature" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {(isBug || isFeature) && (
        <Card mode="contained" style={{ backgroundColor: colors.surface }}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium">{copy.beforeSend}</Text>
            <View style={styles.switches}>
              <SwitchRow label={copy.freeService} value={firstConsent} onValueChange={setFirstConsent} />
              {firstConsent && (
                <SwitchRow label={copy.soloDeveloper} value={secondConsent} onValueChange={setSecondConsent} />
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {canWrite && (
        <Card mode="contained" style={{ backgroundColor: colors.surface }}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium">{copy.feedbackText}</Text>
            <TextInput
              mode="outlined"
              multiline
              value={text}
              onChangeText={setText}
              placeholder={isBug ? copy.bugPlaceholder : isFeature ? copy.featurePlaceholder : copy.thanksPlaceholder}
              style={styles.textInput}
              returnKeyType="send"
              submitBehavior="submit"
              enterKeyHint="send"
              onSubmitEditing={() => void submit()}
            />
            {(isBug || isFeature) && (
              <Button icon="image-plus" mode="outlined" onPress={() => void choosePhoto()}>
                {photo ? copy.photoSelected : copy.addPhoto}
              </Button>
            )}
            <Button
              mode="contained"
              disabled={!text.trim() || isLoading || isUploadingPhoto}
              loading={isLoading || isUploadingPhoto}
              onPress={() => void submit()}>
              {copy.send}
            </Button>
          </Card.Content>
        </Card>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 12 },
  cardContent: { gap: 12 },
  switches: { gap: 8 },
  textInput: { minHeight: 140 },
});
