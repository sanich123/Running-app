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
import type { GroupEditForm } from './types';

export default function EditGroupPage() {
  const router = useRouter();
  const { groupId: rawGroupId } = useLocalSearchParams<{ groupId: string }>();
  const groupId = Array.isArray(rawGroupId) ? rawGroupId[0] : rawGroupId;
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const {
    loadError,
    retry,
    ownerOnlyEdit,
    deleteGroupCancel,
    editGroupTitle,
    editGroupIntro,
    nameRequired,
    chooseSport,
    groupUpdated,
    saveError,
    updateGroupButton,
  } = GROUPS_COPY[language];
  const { data: group, isLoading, isError, refetch } = useGetGroupByIdQuery(groupId ?? '', { skip: !groupId });
  const [formState, setFormState] = useState<{ groupId: string; value: GroupEditForm } | null>(null);
  const [photoAssetId, setPhotoAssetId] = useState<string | null | undefined>(undefined);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [updateGroup, { isLoading: isSaving }] = useUpdateGroupMutation();
  const {
    id = '',
    name = '',
    description = null,
    locationName = null,
    sports = [],
    categoryTags = [],
    privacy = 'open',
    photoUrl,
    photoPreviewUrl,
  } = group ?? {};
  const isOwner = Boolean(group && (group.isOwner || (userId && group.createdByUserId === userId)));
  const initialForm: GroupEditForm = {
    details: {
      name,
      description: description ?? '',
      locationName: locationName ?? '',
    },
    options: { sports, privacy },
  };
  const form = formState?.groupId === id ? formState.value : initialForm;
  const { details, options } = form;
  const { name: editedName, description: editedDescription, locationName: editedLocationName } = details;
  const { sports: selectedSports, privacy: selectedPrivacy } = options;

  return isLoading ? (
    <ActivityIndicator style={styles.loader} />
  ) : isError || !group ? (
    <View style={styles.feedback}>
      <EmptyState icon="account-group-outline" title={loadError} />
      <Button onPress={() => void refetch()}>{retry}</Button>
    </View>
  ) : !isOwner ? (
    <View style={styles.feedback}>
      <EmptyState icon="lock-outline" title={ownerOnlyEdit} />
      <Button onPress={() => router.replace(`/groups/${id}` as never)}>{deleteGroupCancel}</Button>
    </View>
  ) : (
    <>
      <Stack.Screen options={{ title: editGroupTitle }} />
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="headlineSmall" style={styles.heading}>
            {editGroupTitle}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            {editGroupIntro}
          </Text>
          <GroupPhotoPicker
            initialPhotoUrl={photoUrl ?? photoPreviewUrl}
            onPhotoAssetChange={setPhotoAssetId}
            onUploadingChange={setIsUploadingPhoto}
          />
          <GroupDetailsFields
            details={details}
            onChange={(nextDetails) => setFormState({ groupId: id, value: { ...form, details: nextDetails } })}
          />
          <GroupOptionsFields
            options={options}
            onChange={(nextOptions) => setFormState({ groupId: id, value: { ...form, options: nextOptions } })}
          />
          <Button
            mode="contained"
            testID="edit-group-submit"
            onPress={async () => {
              if (editedName.trim().length < 2) return errorToast(nameRequired);
              if (!selectedSports.length) return errorToast(chooseSport);
              try {
                await updateGroup({
                  groupId: id,
                  name: editedName.trim(),
                  description: editedDescription.trim() || null,
                  sports: selectedSports,
                  categoryTags,
                  ...(photoAssetId !== undefined ? { photoAssetId } : {}),
                  privacy: selectedPrivacy,
                  locationName: editedLocationName.trim() || null,
                }).unwrap();
                successToast(groupUpdated);
                router.replace(`/groups/${id}` as never);
              } catch (error) {
                errorToast(saveError, error);
              }
            }}
            loading={isSaving}
            disabled={isSaving || isUploadingPhoto}
            style={styles.submit}>
            {updateGroupButton}
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
