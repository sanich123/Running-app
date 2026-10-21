import { useRef, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import uuid from 'react-native-uuid';
import { Image, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, IconButton, RadioButton, Text, TextInput, useTheme } from 'react-native-paper';
import { useSendFeedbackMutation } from '@R/services/feedback/feedback';
import { useAppSelector } from '@R/typed-hooks';
import { FEEDBACK_TEXT } from '@Routes/feedback/const';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import SwitchRow from '@S/feedback/switch-row/switch-row';
import { deviceMetadata, deviceName, platform } from '@U/device/device-id';
import { uploadFeedbackAttachments } from '@U/feedback-sending';
import { deleteUploadedMedia, getAccessToGallery } from '@U/file-sending';
import type { FeedbackAttachment } from '@R/services/feedback/feedback';
import type { FeedbackKind } from '@Routes/feedback/const';
import type { MediaUploadItem } from '@U/file-sending';
import type * as ImagePicker from 'expo-image-picker';

const MAX_FEEDBACK_ATTACHMENTS = 10;

interface PendingAttachmentPreview {
  mediaId: string;
  uri: string;
}

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
  const [pendingAttachmentPreviews, setPendingAttachmentPreviews] = useState<PendingAttachmentPreview[]>([]);
  const [deletingAttachments, setDeletingAttachments] = useState<string[]>([]);
  const removedPendingMediaIds = useRef(new Set<string>());
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
    const mediaItems: MediaUploadItem[] = selectedPhotos.map((photo) => ({
      fileSrc: photo.file ?? photo.uri,
      metadata: {
        fileName: photo.fileName,
        mimeType: photo.mimeType,
        mediaType: photo.type === 'video' ? 'video' : 'image',
      },
      mediaId: String(uuid.v4()),
    }));
    removedPendingMediaIds.current.clear();
    setFeedbackError(null);
    setPendingAttachmentPreviews(selectedPhotos.map(({ uri }, index) => ({ mediaId: mediaItems[index].mediaId, uri })));
    setIsUploadingPhoto(true);
    try {
      const uploadedAttachments = await uploadFeedbackAttachments(mediaItems, feedbackId);
      const successfulUploadCount = uploadedAttachments.filter(Boolean).length;
      const successfulAttachments = uploadedAttachments.flatMap((attachment, index) =>
        attachment && !removedPendingMediaIds.current.has(mediaItems[index].mediaId) ? [attachment] : [],
      );
      if (successfulAttachments.length) {
        setAttachments((currentAttachments) => [...currentAttachments, ...successfulAttachments]);
      }
      if (successfulUploadCount !== selectedPhotos.length) {
        setFeedbackError(copy.attachmentUploadError);
      }
    } catch (error) {
      errorToast(copy.attachmentUploadError, error);
      setFeedbackError(`${copy.attachmentUploadError}: ${getErrorMessageFromError(error)}`);
    } finally {
      setPendingAttachmentPreviews([]);
      removedPendingMediaIds.current.clear();
      setIsUploadingPhoto(false);
    }
  }

  async function removeAttachment(attachment: FeedbackAttachment) {
    if (deletingAttachments.includes(attachment.url)) return;

    setDeletingAttachments((current) => [...current, attachment.url]);
    setAttachments((current) => current.filter(({ url }) => url !== attachment.url));
    try {
      await deleteUploadedMedia([attachment.url, attachment.thumbnail].filter((url): url is string => Boolean(url)));
    } finally {
      setDeletingAttachments((current) => current.filter((url) => url !== attachment.url));
    }
  }

  function removePendingAttachment(mediaId: string) {
    removedPendingMediaIds.current.add(mediaId);
    setPendingAttachmentPreviews((current) => current.filter((preview) => preview.mediaId !== mediaId));
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
                  {attachments.map((attachment, index) => (
                    <View key={`${attachment.url}-${index}`} style={styles.attachmentPreviewContainer}>
                      <Image
                        testID={`feedback-attachment-preview-${index}`}
                        source={{ uri: attachment.thumbnail || attachment.url }}
                        style={[styles.attachmentPreview, { borderColor: colors.outlineVariant }]}
                        resizeMode="cover"
                      />
                      <IconButton
                        testID={`feedback-remove-attachment-${index}`}
                        accessibilityLabel={copy.removeAttachment}
                        icon={deletingAttachments.includes(attachment.url) ? 'progress-clock' : 'close'}
                        size={14}
                        iconColor={colors.onSurfaceVariant}
                        containerColor={colors.surfaceVariant}
                        mode="contained"
                        style={styles.removeAttachmentButton}
                        onPress={() => void removeAttachment(attachment)}
                        disabled={deletingAttachments.includes(attachment.url)}
                      />
                    </View>
                  ))}
                  {pendingAttachmentPreviews.map(({ mediaId, uri }, index) => (
                    <View key={`pending-${mediaId}`} style={styles.attachmentPreviewContainer}>
                      <Image
                        testID={`feedback-pending-attachment-preview-${index}`}
                        source={{ uri }}
                        style={[styles.attachmentPreview, { borderColor: colors.outlineVariant }]}
                        resizeMode="cover"
                      />
                      <IconButton
                        testID={`feedback-remove-pending-attachment-${index}`}
                        accessibilityLabel={copy.removeAttachment}
                        icon="close"
                        size={14}
                        iconColor={colors.onSurfaceVariant}
                        containerColor={colors.surfaceVariant}
                        mode="contained"
                        style={styles.removeAttachmentButton}
                        onPress={() => removePendingAttachment(mediaId)}
                      />
                    </View>
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
  attachmentPreviewContainer: { position: 'relative' },
  attachmentPreview: {
    width: 96,
    height: 96,
    borderRadius: 8,
    borderWidth: 1,
  },
  removeAttachmentButton: {
    borderColor: 'transparent',
    borderRadius: 16,
    borderWidth: 2,
    elevation: 8,
    height: 30,
    margin: 0,
    padding: 0,
    position: 'absolute',
    right: -7,
    top: -7,
    width: 30,
    zIndex: 10,
  },
});
