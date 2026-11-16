import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  List,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {
  useGetAdminFeedbackByIdQuery,
  useGetAdminFeedbackQuery,
  useReplyToAdminFeedbackMutation,
  useUpdateAdminFeedbackStatusMutation,
} from '@R/services/admin/admin';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { ADMIN_FEEDBACK_COPY, ADMIN_FEEDBACK_STATUSES, getAdminFeedbackKindLabel } from './const';
import type { AdminFeedbackStatus } from '@R/services/admin/types';

export default function AdminFeedback() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { feedbackId: routeFeedbackId } = useLocalSearchParams<{ feedbackId?: string }>();
  const copy = ADMIN_FEEDBACK_COPY[language];
  const [status, setStatus] = useState<AdminFeedbackStatus>('open');
  const [replyText, setReplyText] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    typeof routeFeedbackId === 'string' ? routeFeedbackId : null,
  );
  const { data: requests, isError, isLoading, error, refetch } = useGetAdminFeedbackQuery({ status, take: 100 });
  const selectedRequestQuery = useGetAdminFeedbackByIdQuery(selectedId ?? '', { skip: !selectedId });
  const selectedRequest = selectedRequestQuery.currentData ?? requests?.find(({ id }) => id === selectedId);
  const displayedRequests =
    selectedRequest && !requests?.some(({ id }) => id === selectedRequest.id)
      ? [...(requests ?? []), selectedRequest]
      : (requests ?? []);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateAdminFeedbackStatusMutation();
  const [replyToFeedback, { isLoading: isSendingReply }] = useReplyToAdminFeedbackMutation();

  async function changeStatus(nextStatus: AdminFeedbackStatus) {
    if (!selectedId) return;
    try {
      await updateStatus({ id: selectedId, status: nextStatus }).unwrap();
      successToast(copy.updated);
    } catch (updateError) {
      errorToast(copy.updateError, updateError);
    }
  }

  async function sendReply() {
    if (!selectedId || !replyText.trim()) return;
    try {
      await replyToFeedback({ id: selectedId, text: replyText.trim() }).unwrap();
      setReplyText('');
      successToast(copy.replySent);
    } catch (replyError) {
      errorToast(copy.replyError, replyError);
    }
  }

  if (isError && !requests) return <ErrorComponent error={error} refetch={refetch} />;
  if (selectedId && selectedRequestQuery.isError) {
    return <ErrorComponent error={selectedRequestQuery.error} refetch={selectedRequestQuery.refetch} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SegmentedButtons
        value={status}
        onValueChange={(value) => {
          if (value === 'open' || value === 'in_progress' || value === 'resolved') setStatus(value);
        }}
        buttons={ADMIN_FEEDBACK_STATUSES.map((value) => ({
          value,
          label: copy[value],
          testID: `admin-feedback-status-${value}`,
        }))}
      />
      {isLoading ? <ActivityIndicator size="large" style={styles.loading} /> : null}
      <ScrollView contentContainerStyle={styles.listContent}>
        {displayedRequests.length ? (
          displayedRequests.map((request) => {
            const { id, email, text, kind, createdAt } = request;
            const isExpanded = selectedId === id;
            const createdAtLabel = new Date(createdAt).toLocaleString(language === 'russian' ? 'ru-RU' : 'en-US');
            const expandedRequest = selectedRequest?.id === id ? selectedRequest : request;

            return (
              <List.Accordion
                key={id}
                testID={`admin-feedback-request-${id}`}
                expanded={isExpanded}
                onPress={() => setSelectedId(isExpanded ? null : id)}
                title={getAdminFeedbackKindLabel(kind, copy)}
                description={`${email}\n${createdAtLabel}\n${text}`}
                descriptionNumberOfLines={4}
                titleNumberOfLines={2}
                accessibilityLabel={`${getAdminFeedbackKindLabel(kind, copy)} · ${email} · ${createdAtLabel}`}
                style={[
                  styles.queueItem,
                  { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
                  isExpanded && { borderColor: colors.primary },
                ]}
                rippleColor={colors.primaryContainer}>
                {isExpanded ? (
                  selectedRequestQuery.isLoading && !selectedRequest ? (
                    <ActivityIndicator size="small" style={styles.loading} />
                  ) : (
                    <Card mode="contained" style={[styles.accordionDetails, { backgroundColor: colors.surface }]}>
                      <Card.Content style={styles.cardContent}>
                        {expandedRequest.topic ? (
                          <Text variant="bodyMedium">
                            {copy.topic}: {copy.topics[expandedRequest.topic]}
                          </Text>
                        ) : null}
                        <Text variant="bodyLarge">{expandedRequest.text}</Text>
                        <Text variant="bodyMedium">{expandedRequest.email}</Text>
                        <Text variant="titleSmall">{copy.device}</Text>
                        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                          {expandedRequest.deviceInfo}
                        </Text>
                        {expandedRequest.attachments.length ? (
                          <View style={styles.attachmentList}>
                            <Text variant="titleSmall">{copy.attachments}</Text>
                            {expandedRequest.attachments.map(({ url }, index) => (
                              <Button
                                key={`${url}-${index}`}
                                icon="open-in-new"
                                mode="text"
                                onPress={() =>
                                  void Linking.openURL(url).catch((openError) => errorToast(copy.linkError, openError))
                                }>
                                {copy.attachments} {index + 1}
                              </Button>
                            ))}
                          </View>
                        ) : null}
                        <Divider />
                        <Text variant="titleSmall">{copy.replyHistory}</Text>
                        {expandedRequest.replies?.map(
                          ({ id: replyId, adminEmail, deliveryStatus, text: replyText }) => (
                            <View key={replyId} style={styles.reply}>
                              <View style={styles.titleRow}>
                                <Text variant="bodySmall" style={styles.flex}>
                                  {adminEmail}
                                </Text>
                                <Chip compact>
                                  {deliveryStatus === 'sent'
                                    ? copy.replyDelivered
                                    : deliveryStatus === 'failed'
                                      ? copy.replyFailed
                                      : copy.replyPending}
                                </Chip>
                              </View>
                              <Text variant="bodyMedium">{replyText}</Text>
                            </View>
                          ),
                        )}
                        <TextInput
                          mode="outlined"
                          label={copy.replyLabel}
                          value={replyText}
                          onChangeText={setReplyText}
                          multiline
                          maxLength={10000}
                          style={styles.replyInput}
                        />
                        <Button
                          mode="contained"
                          icon="send"
                          disabled={!replyText.trim() || isSendingReply}
                          loading={isSendingReply}
                          onPress={() => void sendReply()}>
                          {copy.sendReply}
                        </Button>
                        <View style={styles.actions}>
                          {expandedRequest.status !== 'in_progress' ? (
                            <Button
                              mode="outlined"
                              disabled={isUpdating}
                              onPress={() => void changeStatus('in_progress')}>
                              {copy.start}
                            </Button>
                          ) : null}
                          {expandedRequest.status !== 'resolved' ? (
                            <Button
                              mode="contained"
                              disabled={isUpdating}
                              onPress={() => void changeStatus('resolved')}>
                              {copy.resolve}
                            </Button>
                          ) : null}
                          {expandedRequest.status !== 'open' ? (
                            <Button mode="text" disabled={isUpdating} onPress={() => void changeStatus('open')}>
                              {copy.reopen}
                            </Button>
                          ) : null}
                        </View>
                      </Card.Content>
                    </Card>
                  )
                ) : null}
              </List.Accordion>
            );
          })
        ) : !isLoading ? (
          <Text variant="bodyMedium" style={[styles.empty, { color: colors.onSurfaceVariant }]}>
            {copy.empty}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'center', flex: 1, gap: 12, maxWidth: 960, width: '100%' },
  loading: { padding: 24 },
  listContent: { gap: 8, paddingBottom: 24 },
  queueItem: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  empty: { alignSelf: 'center', padding: 24 },
  cardContent: { gap: 12 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  accordionDetails: { borderRadius: 0, elevation: 0, margin: 0 },
  attachmentList: { gap: 4 },
  reply: { borderRadius: 8, gap: 6, padding: 12, backgroundColor: 'rgba(127,127,127,0.12)' },
  replyInput: { minHeight: 120 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
