import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import { useGetGroupByIdQuery, useUpdateGroupMutation } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import EmptyState from '@S/empty-state/empty-state';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { GROUPS_COPY } from '../const';
import GroupDetailsFields from '../create-group-page/group-details-fields/group-details-fields';
import GroupOptionsFields from '../create-group-page/group-options-fields/group-options-fields';
import GroupPhotoPicker from '../create-group-page/group-photo-picker/group-photo-picker';
import type { GroupCreationDetails, GroupCreationOptions } from '../create-group-page/types';

interface GroupEditForm {
  details: GroupCreationDetails;
  options: GroupCreationOptions;
}

export default function EditGroupPage() {
  const router = useRouter();
  const { groupId: rawGroupId } = useLocalSearchParams<{ groupId: string }>();
  const groupId = Array.isArray(rawGroupId) ? rawGroupId[0] : rawGroupId;
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const copy = GROUPS_COPY[language];
  const { data: group, isLoading, isError, refetch } = useGetGroupByIdQuery(groupId ?? '', { skip: !groupId });
  const [formState, setFormState] = useState<{ groupId: string; value: GroupEditForm } | null>(null);
  const [photoAssetId, setPhotoAssetId] = useState<string | null | undefined>(undefined);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [updateGroup, { isLoading: isSaving }] = useUpdateGroupMutation();

  if (isLoading) return <ActivityIndicator style={styles.loader} />;
  if (isError || !group) {
    return (
      <View style={styles.feedback}>
        <EmptyState icon="account-group-outline" title={copy.loadError} />
        <Button onPress={() => void refetch()}>{copy.retry}</Button>
      </View>
    );
  }
  const isOwner = group.isOwner ?? Boolean(userId && group.createdByUserId === userId);
  if (!isOwner) {
    return (
      <View style={styles.feedback}>
        <EmptyState icon="lock-outline" title={copy.ownerOnlyEdit} />
        <Button onPress={() => router.replace(`/groups/${group.id}` as never)}>{copy.deleteGroupCancel}</Button>
      </View>
    );
  }
  const initialForm: GroupEditForm = {
    details: {
      name: group.name,
      description: group.description ?? '',
      locationName: group.locationName ?? '',
      isWorldwide: group.locationName === null,
    },
    options: { sports: group.sports, categoryTags: group.categoryTags, privacy: group.privacy },
  };
  const form = formState?.groupId === group.id ? formState.value : initialForm;

  return (
    <>
      <Stack.Screen options={{ title: copy.editGroupTitle }} />
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="headlineSmall" style={styles.heading}>
            {copy.editGroupTitle}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            {copy.editGroupIntro}
          </Text>
          <GroupPhotoPicker
            initialPhotoUrl={group.photoUrl ?? group.photoPreviewUrl}
            onPhotoAssetChange={setPhotoAssetId}
            onUploadingChange={setIsUploadingPhoto}
          />
          <GroupDetailsFields
            details={form.details}
            onChange={(details) => setFormState({ groupId: group.id, value: { ...form, details } })}
          />
          <GroupOptionsFields
            options={form.options}
            onChange={(options) => setFormState({ groupId: group.id, value: { ...form, options } })}
          />
          <Button
            mode="contained"
            testID="edit-group-submit"
            onPress={async () => {
              if (form.details.name.trim().length < 2) return errorToast(copy.nameRequired);
              if (!form.options.sports.length) return errorToast(copy.chooseSport);
              try {
                await updateGroup({
                  groupId: group.id,
                  name: form.details.name.trim(),
                  description: form.details.description.trim() || null,
                  sports: form.options.sports,
                  categoryTags: form.options.categoryTags,
                  ...(photoAssetId !== undefined ? { photoAssetId } : {}),
                  privacy: form.options.privacy,
                  locationName: form.details.isWorldwide ? null : form.details.locationName.trim() || null,
                }).unwrap();
                successToast(copy.groupUpdated);
                router.replace(`/groups/${group.id}` as never);
              } catch (error) {
                errorToast(copy.saveError, error);
              }
            }}
            loading={isSaving}
            disabled={isSaving || isUploadingPhoto}
            style={styles.submit}>
            {copy.updateGroupButton}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignSelf: 'center', gap: 12, maxWidth: 720, padding: 16, paddingBottom: 32, width: '100%' },
  heading: { fontWeight: '700', marginBottom: 2 },
  submit: { marginTop: 12 },
  loader: { flex: 1 },
  feedback: { flex: 1, justifyContent: 'center', padding: 16 },
});
