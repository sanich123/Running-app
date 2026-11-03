import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Button, SegmentedButtons, Surface, Text, useTheme } from 'react-native-paper';
import { useForm, useWatch } from 'react-hook-form';
import { useCreateGroupPostMutation, useGetGroupByIdQuery, useJoinGroupMutation } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import CustomTextInput from '@S/custom-text-input/custom-text-input';
import EmptyState from '@S/empty-state/empty-state';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { GROUPS_COPY } from '../const';
import GroupPhotoPicker from '../create-group-page/group-photo-picker/group-photo-picker';
import GroupEventForm from '../group-events-page/group-event-form/group-event-form';
import type { ComposerMode } from './types';

export default function CreateGroupContentPage() {
  const router = useRouter();
  const { groupId: rawGroupId } = useLocalSearchParams<{ groupId: string }>();
  const groupId = Array.isArray(rawGroupId) ? rawGroupId[0] : rawGroupId;
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const {
    createContent,
    loadError,
    retry,
    postAccessDenied,
    backToGroup,
    createPost: createPostCopy,
    createEvent,
    eventCreated,
    postPlaceholder,
    postPhoto,
    postPhotoUploadError,
    postCreated,
    postError,
    publishPost,
  } = GROUPS_COPY[language];
  const [mode, setMode] = useState<ComposerMode>('post');
  const {
    data: group,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetGroupByIdQuery(groupId ?? '', {
    skip: !groupId,
    refetchOnMountOrArgChange: true,
  });
  const [, { data: joinResult }] = useJoinGroupMutation({ fixedCacheKey: `group-join-${groupId ?? 'unresolved'}` });
  const [createPost, { isLoading: isPublishing }] = useCreateGroupPostMutation();
  const { control } = useForm<{ text: string }>({ defaultValues: { text: '' } });
  const text = useWatch({ control, name: 'text', defaultValue: '' });
  const [photoAssetId, setPhotoAssetId] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const isGroupOwner = Boolean(group && (group.isOwner || (userId && group.createdByUserId === userId)));
  const membership =
    isFetching && group?.currentMembership === null && joinResult?.id === group.id
      ? joinResult.currentMembership
      : group?.currentMembership;
  const canCreatePost = Boolean(group && (isGroupOwner || membership?.status === 'active'));
  const canCreateEvent = Boolean(group?.canManage || isGroupOwner);
  const isResolvingMembership = Boolean(isFetching && !membership && !isGroupOwner);

  return (
    <>
      <Stack.Screen options={{ title: createContent }} />
      {isLoading || isResolvingMembership ? (
        <ActivityIndicator style={styles.loader} />
      ) : isError || !group ? (
        <View style={styles.feedback}>
          <EmptyState icon="account-group-outline" title={loadError} />
          <Button onPress={() => void refetch()}>{retry}</Button>
        </View>
      ) : !canCreatePost ? (
        <View style={styles.feedback}>
          <EmptyState icon="lock-outline" title={postAccessDenied} />
          <Button onPress={() => router.back()}>{backToGroup}</Button>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={[styles.screen, { backgroundColor: colors.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {group.name}
            </Text>
            {canCreateEvent ? (
              <SegmentedButtons
                value={mode}
                onValueChange={(value) => {
                  if (value === 'post' || value === 'event') setMode(value);
                }}
                buttons={[
                  { value: 'post', label: createPostCopy, icon: 'pencil-outline' },
                  { value: 'event', label: createEvent, icon: 'calendar-plus' },
                ]}
              />
            ) : null}
            {mode === 'event' && canCreateEvent ? (
              <GroupEventForm
                groupId={group.id}
                groupSports={group.sports}
                copy={GROUPS_COPY[language]}
                onCreated={() => {
                  successToast(eventCreated);
                  router.back();
                }}
              />
            ) : (
              <Surface style={[styles.postForm, { backgroundColor: colors.surface }]} elevation={1}>
                <Text variant="titleLarge" style={styles.formTitle}>
                  {createPostCopy}
                </Text>
                <CustomTextInput<{ text: string }>
                  control={control}
                  fieldName="text"
                  multiline
                  maxLength={2000}
                  placeholder={postPlaceholder}
                  testID="group-post-input"
                  validation={{ required: '' }}
                />
                <Text variant="titleSmall">{postPhoto}</Text>
                <GroupPhotoPicker
                  onPhotoAssetChange={setPhotoAssetId}
                  onUploadingChange={setIsUploadingPhoto}
                  uploadErrorMessage={postPhotoUploadError}
                />
                <Button
                  mode="contained"
                  icon="send"
                  testID="group-post-submit"
                  disabled={!text.trim() || isPublishing || isUploadingPhoto}
                  loading={isPublishing}
                  onPress={async () => {
                    if (!groupId || !text.trim()) return;
                    try {
                      await createPost({
                        groupId,
                        text: text.trim(),
                        ...(photoAssetId ? { photoAssetId } : {}),
                      }).unwrap();
                      successToast(postCreated);
                      router.back();
                    } catch (error) {
                      errorToast(postError, error);
                    }
                  }}>
                  {publishPost}
                </Button>
              </Surface>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignSelf: 'center', gap: 12, maxWidth: 720, padding: 16, paddingBottom: 32, width: '100%' },
  postForm: { borderRadius: 20, gap: 12, padding: 16 },
  formTitle: { fontWeight: '700' },
  loader: { flex: 1 },
  feedback: { flex: 1, justifyContent: 'center', padding: 16 },
});
