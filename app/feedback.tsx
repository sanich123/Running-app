import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import uuid from 'react-native-uuid';
import { Image, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, RadioButton, Text, TextInput, useTheme } from 'react-native-paper';
import { useSendFeedbackMutation } from '@R/services/feedback/feedback';
import { useAppSelector } from '@R/typed-hooks';
import { FEEDBACK_TEXT } from '@Routes/feedback/const';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import SwitchRow from '@S/feedback/switch-row';
import { deviceMetadata, deviceName, platform } from '@U/device/device-id';
import { uploadFeedbackAttachments } from '@U/feedback-sending';
import { getAccessToGallery } from '@U/file-sending';
import type { FeedbackAttachment } from '@R/services/feedback/feedback';
import type { FeedbackKind } from '@Routes/feedback/const';
import type * as ImagePicker from 'expo-image-picker';

const MAX_FEEDBACK_ATTACHMENTS = 10;

export default function FeedbackPage() {
  const { colors } = useTheme();
  const { back } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = FEEDBACK_TEXT[language];
  const [kind, setKind] = useState<FeedbackKind | null>(null);
  const [firstConsent, setFirstConsent] = useState(false);
  const [secondConsent, setSecondConsent] = useState(false);
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<FeedbackAttachment[]>([]);
  const [feedbackId] = useState(() => String(uuid.v4()));
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [sendFeedback, { isLoading }] = useSendFeedbackMutation();

  const isBug = kind === 'bug';
  const isFeature = kind === 'feature';
  const canWrite = kind === 'thanks' || (isBug && secondConsent) || (isFeature && secondConsent);
  async function choosePhoto() {
    if (attachments.length >= MAX_FEEDBACK_ATTACHMENTS) return;

    let result: ImagePicker.ImagePickerResult | undefined;
    try {
      result = await getAccessToGallery(['images', 'videos'], {
        allowsMultipleSelection: true,
        selectionLimit: MAX_FEEDBACK_ATTACHMENTS - attachments.length,
      });
    } catch (error) {
      errorToast(copy.openGalleryError, error);
      setFeedbackError(`${copy.openGalleryError}: ${getErrorMessageFromError(error)}`);
      return;
    }

    if (!result || result.canceled || !result.assets?.length) return;

    const selectedPhotos = result.assets.slice(0, MAX_FEEDBACK_ATTACHMENTS - attachments.length);
    setFeedbackError(null);
    setIsUploadingPhoto(true);
    try {
      const uploadedAttachments = await uploadFeedbackAttachments(
        selectedPhotos.map((photo) => ({
          fileSrc: photo.file ?? photo.uri,
          metadata: {
            fileName: photo.fileName,
            mimeType: photo.mimeType,
            mediaType: photo.type === 'video' ? 'video' : 'image',
          },
          mediaId: String(uuid.v4()),
        })),
        feedbackId,
      );
      const successfulAttachments = uploadedAttachments.filter(
        (attachment): attachment is NonNullable<typeof attachment> => attachment !== null,
      );
      if (successfulAttachments.length) {
        setAttachments((currentAttachments) => [...currentAttachments, ...successfulAttachments]);
      }
      if (successfulAttachments.length !== selectedPhotos.length) {
        setFeedbackError(copy.attachmentUploadError);
      }
    } catch (error) {
      errorToast(copy.attachmentUploadError, error);
      setFeedbackError(`${copy.attachmentUploadError}: ${getErrorMessageFromError(error)}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function submit() {
    if (!kind || !text.trim() || !canWrite) return;
    setFeedbackError(null);
    try {
      await sendFeedback({
        feedbackId,
        kind,
        text: text.trim(),
        deviceInfo: JSON.stringify({ platform, deviceName, ...deviceMetadata }),
        ...(attachments.length ? { attachments } : {}),
      }).unwrap();
      back();
    } catch (error) {
      errorToast(copy.submitError, error);
      setFeedbackError(`${copy.submitError}: ${getErrorMessageFromError(error)}`);
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
              <>
                <Button
                  icon="image-plus"
                  mode="outlined"
                  disabled={attachments.length >= MAX_FEEDBACK_ATTACHMENTS || isUploadingPhoto}
                  onPress={() => void choosePhoto()}>
                  {attachments.length ? copy.photoUploaded : copy.addPhoto}
                </Button>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  {copy.attachmentLimit}
                </Text>
                <View style={styles.attachmentPreviews}>
                  {attachments.map(({ url, thumbnail }, index) => (
                    <Image
                      key={`${url}-${index}`}
                      testID={`feedback-attachment-preview-${index}`}
                      source={{ uri: thumbnail || url }}
                      style={[styles.attachmentPreview, { borderColor: colors.outlineVariant }]}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              </>
            )}
            {feedbackError && (
              <Text testID="feedback-error" variant="bodySmall" style={{ color: colors.error }}>
                {feedbackError}
              </Text>
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
  attachmentPreviews: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  attachmentPreview: {
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '30%',
    flexGrow: 1,
    maxWidth: '32%',
  },
});
