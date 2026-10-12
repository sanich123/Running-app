import { useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Platform, StyleSheet, View } from 'react-native';
import { Switch, Text, useTheme } from 'react-native-paper';
import { useUpdateProfileByUserIdMutation } from '@R/services/profile/profile';
import { setSaveCameraPhotosToGallery } from '@R/slices/settings/settings';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { PROFILE_PRIVACY_SETTING_FIELDS, PROFILE_PRIVACY_SETTINGS, type ProfilePrivacySettingKey } from './const';
import type { ProfileSettings } from '@R/services/profile/types';

interface ProfilePrivacySettingsProps {
  userId: string;
  profileSearchVisible: boolean;
  allowNewFollowers?: boolean;
  allowActivityInteractions: boolean;
  allowActivityReplayViewing?: boolean;
  allowActivitySharing?: boolean;
  emailNotifications?: boolean;
  hideActivityStatistics: boolean;
  hideFollowingList: boolean;
  hideProfilePhotos: boolean;
}

type ProfilePrivacyValues = Record<ProfilePrivacySettingKey, boolean>;

function getPrivacyValues(props: ProfilePrivacySettingsProps): ProfilePrivacyValues {
  return {
    profileSearchVisible: props.profileSearchVisible,
    allowNewFollowers: props.allowNewFollowers !== false,
    allowActivityInteractions: props.allowActivityInteractions,
    allowActivityReplayViewing: props.allowActivityReplayViewing !== false,
    allowActivitySharing: props.allowActivitySharing !== false,
    emailNotifications: props.emailNotifications === true,
    hideActivityStatistics: props.hideActivityStatistics,
    hideFollowingList: props.hideFollowingList,
    hideProfilePhotos: props.hideProfilePhotos,
  };
}

export default function ProfilePrivacySettings({
  userId,
  profileSearchVisible,
  allowNewFollowers,
  allowActivityInteractions,
  allowActivityReplayViewing,
  allowActivitySharing,
  emailNotifications,
  hideActivityStatistics,
  hideFollowingList,
  hideProfilePhotos,
}: ProfilePrivacySettingsProps) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { language, saveCameraPhotosToGallery } = useAppSelector(({ settings }) => settings);
  const [updateProfile, { isLoading }] = useUpdateProfileByUserIdMutation();
  const [isRequestingGalleryPermission, setIsRequestingGalleryPermission] = useState(false);
  const [settings, setSettings] = useState<ProfilePrivacyValues>(() =>
    getPrivacyValues({
      userId,
      profileSearchVisible,
      allowNewFollowers,
      allowActivityInteractions,
      allowActivityReplayViewing,
      allowActivitySharing,
      emailNotifications,
      hideActivityStatistics,
      hideFollowingList,
      hideProfilePhotos,
    }),
  );
  const text = PROFILE_PRIVACY_SETTINGS[language];

  const saveSetting = async (setting: ProfilePrivacySettingKey, value: boolean) => {
    const previousValue = settings[setting];
    setSettings((previous) => ({ ...previous, [setting]: value }));
    try {
      const body = { [setting]: value } as ProfileSettings;
      await updateProfile({ id: userId, body }).unwrap();
    } catch (error) {
      setSettings((previous) => ({ ...previous, [setting]: previousValue }));
      errorToast(text.saveError, error);
    }
  };

  const changeSaveCameraPhotosToGallery = async (enabled: boolean) => {
    if (!enabled) {
      dispatch(setSaveCameraPhotosToGallery(false));
      return;
    }

    const needsWritePermission = Platform.OS === 'ios' || (Platform.OS === 'android' && Number(Platform.Version) < 30);
    if (!needsWritePermission) {
      dispatch(setSaveCameraPhotosToGallery(true));
      return;
    }

    setIsRequestingGalleryPermission(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true, ['photo']);
      if (permission.granted) {
        dispatch(setSaveCameraPhotosToGallery(true));
      } else {
        errorToast(text.saveCameraPhotosPermissionDenied);
      }
    } catch (error) {
      errorToast(text.saveCameraPhotosPermissionError, error);
    } finally {
      setIsRequestingGalleryPermission(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <Text variant="titleMedium" style={{ color: colors.primary }}>
        {text.title}
      </Text>
      {PROFILE_PRIVACY_SETTING_FIELDS.map(({ key, label, description }) => (
        <View key={key} style={styles.setting}>
          <View style={styles.copy}>
            <Text variant="bodyMedium">{text[label]}</Text>
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
              {text[description]}
            </Text>
          </View>
          <Switch
            testID={`privacy-setting-${key}`}
            accessibilityLabel={text[label]}
            value={settings[key]}
            onValueChange={(value) => void saveSetting(key, value)}
            disabled={isLoading}
          />
        </View>
      ))}
      {Platform.OS !== 'web' && (
        <View style={styles.setting}>
          <View style={styles.copy}>
            <Text variant="bodyMedium">{text.saveCameraPhotosToGallery}</Text>
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
              {text.saveCameraPhotosToGalleryDescription}
            </Text>
          </View>
          <Switch
            testID="privacy-setting-saveCameraPhotosToGallery"
            accessibilityLabel={text.saveCameraPhotosToGallery}
            value={saveCameraPhotosToGallery}
            onValueChange={(value) => void changeSaveCameraPhotosToGallery(value)}
            disabled={isLoading || isRequestingGalleryPermission}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    marginTop: 12,
    padding: 16,
  },
  setting: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
