import { useRef, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import uuid from 'react-native-uuid';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Chip, IconButton, List, RadioButton, Text, TextInput, useTheme } from 'react-native-paper';
import { useForm, useWatch } from 'react-hook-form';
import { useSendFeedbackMutation } from '@R/services/feedback/feedback';
import { useAppSelector } from '@R/typed-hooks';
import { FEEDBACK_TEXT, FEEDBACK_TOPICS } from '@Routes/feedback/const';
import CustomTextInput from '@S/custom-text-input/custom-text-input';
import { getEmailValidation } from '@S/custom-text-input/types';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import MediaThumbnail from '@S/media-thumbnail/media-thumbnail';
import { deviceMetadata, deviceName, platform } from '@U/device/device-id';
import { uploadFeedbackAttachments } from '@U/feedback-sending';
import { deleteUploadedMedia, getAccessToGallery } from '@U/file-sending';
import { MAX_FEEDBACK_ATTACHMENTS } from './const';
import type { FeedbackContactForm, PendingAttachmentPreview } from './types';
import type { FeedbackAttachment } from '@R/services/feedback/feedback';
import type { FeedbackKind, FeedbackTopic } from '@Routes/feedback/const';
import type { MediaUploadItem } from '@U/file-sending';
import type * as ImagePicker from 'expo-image-picker';

export default function FeedbackPage() {
  const { colors } = useTheme();
  const { back } = useRouter();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = FEEDBACK_TEXT[language];
  const {
    control,
    handleSubmit,
    reset: resetContactForm,
  } = useForm<FeedbackContactForm>({
    defaultValues: { email: '' },
    mode: 'onSubmit',
  });
  const contactEmail = useWatch({ control, name: 'email' });
  const [kind, setKind] = useState<FeedbackKind | null>(null);
  const [topic, setTopic] = useState<FeedbackTopic | null>(null);
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<FeedbackAttachment[]>([]);
  const [pendingAttachmentPreviews, setPendingAttachmentPreviews] = useState<PendingAttachmentPreview[]>([]);
  const [deletingAttachments, setDeletingAttachments] = useState<string[]>([]);
  const removedPendingMediaIds = useRef(new Set<string>());
  const [feedbackId, setFeedbackId] = useState(() => String(uuid.v4()));
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ id: string; email: string; confirmationEmailSent: boolean } | null>(null);
  const [sendFeedback, { isLoading }] = useSendFeedbackMutation();

  const isBug = kind === 'bug';
  const isFeature = kind === 'feature';
  const isQuestion = kind === 'question';
  const canWrite = kind !== null;
  const hasValidEmail = Boolean(userId) || getEmailValidation(language).validate(contactEmail ?? '') === true;
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
    setPendingAttachmentPreviews(
      selectedPhotos.map(({ uri, type }, index) => ({
        mediaId: mediaItems[index].mediaId,
        uri,
        isVideo: type === 'video',
      })),
    );
    setIsUploadingPhoto(true);
    try {
      const uploadedAttachments = await uploadFeedbackAttachments(mediaItems, feedbackId);
      const successfulUploadCount = uploadedAttachments.filter(Boolean).length;
      const successfulAttachments = uploadedAttachments.flatMap((attachment, index) =>
        attachment?.url && !removedPendingMediaIds.current.has(mediaItems[index].mediaId)
          ? [{ ...attachment, url: attachment.url }]
          : [],
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
      await deleteUploadedMedia(
        [attachment.url, attachment.thumbnail].filter((url): url is string => Boolean(url)),
        [],
        feedbackId,
      );
    } finally {
      setDeletingAttachments((current) => current.filter((url) => url !== attachment.url));
    }
  }

  function removePendingAttachment(mediaId: string) {
    removedPendingMediaIds.current.add(mediaId);
    setPendingAttachmentPreviews((current) => current.filter((preview) => preview.mediaId !== mediaId));
  }

  async function submit({ email }: FeedbackContactForm) {
    if (!kind || !text.trim() || !canWrite || (!userId && !email.trim())) return;
    setFeedbackError(null);
    try {
      const response = await sendFeedback({
        feedbackId,
        kind,
        ...(topic ? { topic } : {}),
        text: text.trim(),
        deviceInfo: JSON.stringify({ platform, deviceName, ...deviceMetadata }),
        ...(!userId ? { email: email.trim() } : {}),
        ...(attachments.length ? { attachments } : {}),
      }).unwrap();
      setReceipt({
        id: response.id || feedbackId,
        email: response.email || email.trim(),
        confirmationEmailSent: response.confirmationEmailSent,
      });
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
      {receipt ? (
        <Card mode="contained" style={{ backgroundColor: colors.surface }}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleLarge">{copy.acceptedTitle}</Text>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {receipt.confirmationEmailSent ? `${copy.acceptedEmail} ${receipt.email}.` : copy.acceptedEmailFailed}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {copy.reference}: {receipt.id}
            </Text>
            <Button
              mode="outlined"
              onPress={() => {
                setReceipt(null);
                setFeedbackId(String(uuid.v4()));
                setKind(null);
                setTopic(null);
                setText('');
                setAttachments([]);
                resetContactForm();
              }}>
              {copy.sendAnother}
            </Button>
            <Button mode="text" onPress={() => back()}>
              {copy.close}
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <>
          <Card mode="contained" style={{ backgroundColor: colors.surface }}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleLarge">{copy.title}</Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {copy.intro}
              </Text>
            </Card.Content>
          </Card>

          {copy.faq.map(({ question, answer }, index) => (
            <Card key={question} mode="contained" style={{ backgroundColor: colors.surface }}>
              <List.Accordion id={`feedback-faq-${index}`} title={question} titleNumberOfLines={3}>
                <Text variant="bodyMedium" style={[styles.faqAnswer, { color: colors.onSurfaceVariant }]}>
                  {answer}
                </Text>
              </List.Accordion>
            </Card>
          ))}

          <Card mode="contained" style={{ backgroundColor: colors.surface }}>
            <Card.Content style={styles.cardContent}>
              <RadioButton.Group
                onValueChange={(value) => {
                  if (value === 'bug' || value === 'feature' || value === 'question') setKind(value);
                  setTopic(null);
                }}
                value={kind ?? ''}>
                <RadioButton.Item label={copy.bug} value="bug" />
                <RadioButton.Item label={copy.feature} value="feature" />
                <RadioButton.Item label={copy.question} value="question" />
              </RadioButton.Group>
            </Card.Content>
          </Card>

          {isQuestion && (
            <Card mode="contained" style={{ backgroundColor: colors.surface }}>
              <Card.Content style={styles.cardContent}>
                <Text variant="titleMedium">{copy.topic}</Text>
                <View style={styles.topics}>
                  {FEEDBACK_TOPICS.map((topicValue) => (
                    <Chip
                      key={topicValue}
                      selected={topic === topicValue}
                      onPress={() => setTopic(topicValue)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: topic === topicValue }}>
                      {copy.topics[topicValue]}
                    </Chip>
                  ))}
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
                  placeholder={
                    isBug ? copy.bugPlaceholder : isFeature ? copy.featurePlaceholder : copy.questionPlaceholder
                  }
                  style={styles.textInput}
                  returnKeyType="send"
                  submitBehavior="submit"
                  enterKeyHint="send"
                  onSubmitEditing={() => void handleSubmit(submit)()}
                />
                {!userId && (
                  <>
                    <CustomTextInput<FeedbackContactForm>
                      control={control}
                      fieldName="email"
                      label={copy.email}
                      validation={{ ...getEmailValidation(language), required: copy.emailRequired }}
                      inputMode="email"
                      autoComplete="email"
                      accessibilityLabel={copy.email}
                      maxLength={255}
                    />
                    <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                      {copy.emailHint}
                    </Text>
                  </>
                )}
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
                          <MediaThumbnail
                            testID={`feedback-attachment-preview-${index}`}
                            mediaUrl={attachment.url}
                            thumbnail={attachment.thumbnail}
                            style={[styles.attachmentPreview, { borderColor: colors.outlineVariant }]}
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
                      {pendingAttachmentPreviews.map(({ mediaId, uri, isVideo }, index) => (
                        <View key={`pending-${mediaId}`} style={styles.attachmentPreviewContainer}>
                          <MediaThumbnail
                            testID={`feedback-pending-attachment-preview-${index}`}
                            mediaUrl={uri}
                            isVideo={isVideo}
                            style={[styles.attachmentPreview, { borderColor: colors.outlineVariant }]}
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
                  disabled={!text.trim() || !hasValidEmail || isLoading || isUploadingPhoto || (isQuestion && !topic)}
                  loading={isLoading || isUploadingPhoto}
                  onPress={() => void handleSubmit(submit)()}>
                  {copy.send}
                </Button>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  {copy.privacyNotice}
                </Text>
              </Card.Content>
            </Card>
          )}
        </>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 760,
    padding: 12,
    gap: 12,
  },
  cardContent: { gap: 12 },
  faqAnswer: { paddingBottom: 12, paddingHorizontal: 16 },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
