import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, useTheme } from 'react-native-paper';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import { useCreateGroupMutation } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { GROUPS_COPY } from '../const';
import GroupDetailsFields from './group-details-fields/group-details-fields';
import GroupOptionsFields from './group-options-fields/group-options-fields';
import GroupPhotoPicker from './group-photo-picker/group-photo-picker';
import type { GroupCreationDetails, GroupCreationOptions } from './types';

export default function CreateGroupPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { createIntroTitle, createIntroText, nameRequired, chooseSport, saveError, createButton } =
    GROUPS_COPY[language];
  const [details, setDetails] = useState<GroupCreationDetails>({
    name: '',
    description: '',
    locationName: '',
    isWorldwide: false,
  });
  const [options, setOptions] = useState<GroupCreationOptions>({
    sports: [SPORTS_BTNS_VALUES.run],
    privacy: 'open',
  });
  const [photoAssetId, setPhotoAssetId] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [createGroup, { isLoading }] = useCreateGroupMutation();
  const { name, description, locationName, isWorldwide } = details;
  const { sports, privacy } = options;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.heading}>
          {createIntroTitle}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          {createIntroText}
        </Text>

        <GroupPhotoPicker onPhotoAssetChange={setPhotoAssetId} onUploadingChange={setIsUploadingPhoto} />
        <GroupDetailsFields details={details} onChange={setDetails} />
        <GroupOptionsFields options={options} onChange={setOptions} />

        <Button
          mode="contained"
          testID="create-group-submit"
          onPress={async () => {
            if (!name.trim()) {
              return errorToast(nameRequired);
            }
            if (!sports.length) {
              return errorToast(chooseSport);
            }
            try {
              const group = await createGroup({
                name: name.trim(),
                description: description.trim() || undefined,
                locationName: isWorldwide ? undefined : locationName.trim() || undefined,
                sports,
                ...(photoAssetId ? { photoAssetId } : {}),
                privacy,
              }).unwrap();
              const { id } = group;
              router.replace(`/groups/${id}` as never);
            } catch (error) {
              errorToast(saveError, error);
            }
          }}
          loading={isLoading}
          disabled={isLoading || isUploadingPhoto}
          style={styles.submit}>
          {createButton}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignSelf: 'center', gap: 12, maxWidth: 720, padding: 16, paddingBottom: 32, width: '100%' },
  heading: { fontWeight: '700', marginBottom: 2 },
  submit: { marginTop: 12 },
});
