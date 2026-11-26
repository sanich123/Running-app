import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { v4 as generateUuid } from 'react-native-uuid';
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
import { MAX_FEEDBACK_ATTACHMENTS } from './const';
import useFeedbackAttachments from './use-feedback-attachments';
import type { FeedbackContactForm } from './types';
import type { FeedbackKind, FeedbackTopic } from '@Routes/feedback/const';

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
  const [feedbackId, setFeedbackId] = useState(() => String(generateUuid()));
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ id: string; email: string; confirmationEmailSent: boolean } | null>(null);
  const [sendFeedback, { isLoading }] = useSendFeedbackMutation();
  const {
    attachments,
    pendingAttachmentPreviews,
    deletingAttachments,
    isUploadingPhoto,
    choosePhoto,
    removeAttachment,
    removePendingAttachment,
    clearAttachments,
  } = useFeedbackAttachments({ feedbackId, copy, setFeedbackError });

  const isBug = kind === 'bug';
  const isFeature = kind === 'feature';
  const isQuestion = kind === 'question';
  const canWrite = kind !== null;
  const hasValidEmail = Boolean(userId) || getEmailValidation(language).validate(contactEmail ?? '') === true;
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
                setFeedbackId(String(generateUuid()));
                setKind(null);
                setTopic(null);
                setText('');
                clearAttachments();
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
  cardContent: { gap: 12, paddingHorizontal: 16 },
  faqAnswer: { paddingHorizontal: 16, paddingVertical: 12 },
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
