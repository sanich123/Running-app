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
  const selectedRequest = selectedRequestQuery.data ?? requests?.find(({ id }) => id === selectedId);
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
      {selectedRequest ? (
        <ScrollView contentContainerStyle={styles.detailContent}>
          <Button icon="arrow-left" mode="text" style={styles.backButton} onPress={() => setSelectedId(null)}>
            {copy.back}
          </Button>
          <Card mode="contained" style={{ backgroundColor: colors.surface }}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.titleRow}>
                <Text variant="titleLarge" style={styles.flex}>
                  {getAdminFeedbackKindLabel(selectedRequest.kind, copy)}
                </Text>
                <Chip>{copy[selectedRequest.status]}</Chip>
              </View>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {new Date(selectedRequest.createdAt).toLocaleString(language === 'russian' ? 'ru-RU' : 'en-US')}
              </Text>
              {selectedRequest.topic ? (
                <Text variant="bodyMedium">
                  {copy.topic}: {copy.topics[selectedRequest.topic]}
                </Text>
              ) : null}
              <Divider />
              <Text variant="bodyLarge">{selectedRequest.text}</Text>
              <Text variant="bodyMedium">{selectedRequest.email}</Text>
              <Text variant="titleSmall">{copy.device}</Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {selectedRequest.deviceInfo}
              </Text>
              {selectedRequest.attachments.length ? (
                <View style={styles.attachmentList}>
                  <Text variant="titleSmall">{copy.attachments}</Text>
                  {selectedRequest.attachments.map(({ url }, index) => (
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
              {selectedRequest.replies?.map(({ id, adminEmail, deliveryStatus, text: replyText }) => (
                <View key={id} style={styles.reply}>
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
              ))}
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
                icon="email-send-outline"
                disabled={!replyText.trim() || isSendingReply}
                loading={isSendingReply}
                onPress={() => void sendReply()}>
                {copy.sendReply}
              </Button>
              <View style={styles.actions}>
                {selectedRequest.status !== 'in_progress' ? (
                  <Button mode="outlined" disabled={isUpdating} onPress={() => void changeStatus('in_progress')}>
                    {copy.start}
                  </Button>
                ) : null}
                {selectedRequest.status !== 'resolved' ? (
                  <Button mode="contained" disabled={isUpdating} onPress={() => void changeStatus('resolved')}>
                    {copy.resolve}
                  </Button>
                ) : null}
                {selectedRequest.status !== 'open' ? (
                  <Button mode="text" disabled={isUpdating} onPress={() => void changeStatus('open')}>
                    {copy.reopen}
                  </Button>
                ) : null}
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      ) : isLoading || (selectedId && selectedRequestQuery.isLoading) ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {requests?.length ? (
            requests.map(({ id, email, text, kind, status }) => (
              <List.Item
                key={id}
                testID={'admin-feedback-request-' + id}
                title={getAdminFeedbackKindLabel(kind, copy)}
                description={email + '\n' + text}
                descriptionNumberOfLines={2}
                right={() => <Chip style={styles.statusChip}>{copy[status]}</Chip>}
                onPress={() => setSelectedId(id)}
                style={[styles.listItem, { backgroundColor: colors.surface }]}
              />
            ))
          ) : (
            <Text variant="bodyMedium" style={[styles.empty, { color: colors.onSurfaceVariant }]}>
              {copy.empty}
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, paddingBottom: 24 },
  loading: { padding: 24 },
  listContent: { gap: 8, paddingBottom: 24 },
  listItem: { borderRadius: 8 },
  statusChip: { alignSelf: 'center', marginRight: 8 },
  empty: { alignSelf: 'center', padding: 24 },
  detailContent: { gap: 12, paddingBottom: 24 },
  backButton: { alignSelf: 'flex-start' },
  cardContent: { gap: 12 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  attachmentList: { gap: 4 },
  reply: { borderRadius: 8, gap: 6, padding: 12, backgroundColor: 'rgba(127,127,127,0.12)' },
  replyInput: { minHeight: 120 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
