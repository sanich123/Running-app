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
  const copy = GROUPS_COPY[language];
  const [details, setDetails] = useState<GroupCreationDetails>({
    name: '',
    description: '',
    locationName: '',
    isWorldwide: false,
  });
  const [options, setOptions] = useState<GroupCreationOptions>({
    sports: [SPORTS_BTNS_VALUES.run],
    categoryTags: [],
    privacy: 'open',
  });
  const [photoAssetId, setPhotoAssetId] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [createGroup, { isLoading }] = useCreateGroupMutation();

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.heading}>
          {copy.createIntroTitle}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          {copy.createIntroText}
        </Text>

        <GroupPhotoPicker onPhotoAssetChange={setPhotoAssetId} onUploadingChange={setIsUploadingPhoto} />
        <GroupDetailsFields details={details} onChange={setDetails} />
        <GroupOptionsFields options={options} onChange={setOptions} />

        <Button
          mode="contained"
          testID="create-group-submit"
          onPress={async () => {
            if (!details.name.trim()) {
              errorToast(copy.nameRequired);
              return;
            }
            if (!options.sports.length) {
              errorToast(copy.chooseSport);
              return;
            }
            try {
              const group = await createGroup({
                name: details.name.trim(),
                description: details.description.trim() || undefined,
                locationName: details.isWorldwide ? undefined : details.locationName.trim() || undefined,
                sports: options.sports,
                categoryTags: options.categoryTags,
                ...(photoAssetId ? { photoAssetId } : {}),
                privacy: options.privacy,
              }).unwrap();
              router.replace(`/groups/${group.id}` as never);
            } catch (error) {
              errorToast(copy.saveError, error);
            }
          }}
          loading={isLoading}
          disabled={isLoading || isUploadingPhoto}
          style={styles.submit}>
          {copy.createButton}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: 12, padding: 16, paddingBottom: 32 },
  heading: { fontWeight: '700', marginBottom: 2 },
  submit: { marginTop: 12 },
});
