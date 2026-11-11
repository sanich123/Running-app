import { useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Platform, StyleSheet, View } from 'react-native';
import { List, Switch, Text, useTheme } from 'react-native-paper';
import { useUpdateProfileByUserIdMutation } from '@R/services/profile/profile';
import { setSaveCameraPhotosToGallery } from '@R/slices/activity-settings/activity-settings';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import GroupNotificationSettings from '@Routes/groups/group-notification-settings/group-notification-settings';
import { errorToast } from '@S/error-toast/error-toast';
import { PROFILE_PRIVACY_SETTING_SECTIONS, PROFILE_PRIVACY_SETTINGS, type ProfilePrivacySettingKey } from '../const';
import ActivityPrivacyPreview from './activity-privacy-preview/activity-privacy-preview';
import ProfilePrivacyPreview from './profile-privacy-preview/profile-privacy-preview';
import { getPrivacyValues } from './utils';
import type { ProfilePrivacySettingsProps, ProfilePrivacyValues } from './types';
import type { ProfileSettings } from '@R/services/profile/types';

export default function ProfilePrivacySettings({
  userId,
  profileSearchVisible,
  allowNewFollowers,
  allowActivityInteractions,
  allowActivityReplayViewing,
  allowActivityHeartRateViewing,
  allowActivityElevationViewing,
  allowActivityPaceViewing,
  allowActivitySharing,
  hideActivityStatistics,
  hideFollowingList,
  hideProfilePhotos,
}: ProfilePrivacySettingsProps) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ settings }) => settings);
  const { saveCameraPhotosToGallery } = useAppSelector(({ activitySettings }) => activitySettings);
  const [updateProfile, { isLoading }] = useUpdateProfileByUserIdMutation();
  const [isRequestingGalleryPermission, setIsRequestingGalleryPermission] = useState(false);
  const [isProfilePreviewExpanded, setIsProfilePreviewExpanded] = useState(false);
  const [isActivityPreviewExpanded, setIsActivityPreviewExpanded] = useState(false);
  const [settings, setSettings] = useState<ProfilePrivacyValues>(() =>
    getPrivacyValues({
      userId,
      profileSearchVisible,
      allowNewFollowers,
      allowActivityInteractions,
      allowActivityReplayViewing,
      allowActivityHeartRateViewing,
      allowActivityElevationViewing,
      allowActivityPaceViewing,
      allowActivitySharing,
      hideActivityStatistics,
      hideFollowingList,
      hideProfilePhotos,
    }),
  );
  const text = PROFILE_PRIVACY_SETTINGS[language];

  const saveSetting = async (setting: ProfilePrivacySettingKey, value: boolean, reverseValue: boolean) => {
    const previousValue = settings[setting];
    const profileValue = reverseValue ? !value : value;
    setSettings((previous) => ({ ...previous, [setting]: profileValue }));
    try {
      const body = { [setting]: profileValue } as ProfileSettings;
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
      {PROFILE_PRIVACY_SETTING_SECTIONS.map(({ title, fields }) => (
        <View key={title} style={styles.group}>
          <Text variant="titleSmall" style={[styles.groupTitle, { color: colors.primary }]}>
            {text[title]}
          </Text>
          {fields.map(({ key, label, reverseValue }) => (
            <View key={key} style={styles.setting}>
              <Text variant="bodyMedium" style={styles.copy}>
                {text[label]}
              </Text>
              <Switch
                testID={`privacy-setting-${key}`}
                accessibilityLabel={text[label]}
                value={reverseValue ? !settings[key] : settings[key]}
                onValueChange={(value) => void saveSetting(key, value, reverseValue)}
                disabled={isLoading}
              />
            </View>
          ))}
          {title === 'activitySectionTitle' ? (
            <List.Accordion
              testID="activity-preview-accordion"
              title={text.activityPreviewTitle}
              titleStyle={{ color: colors.onSurface }}
              expanded={isActivityPreviewExpanded}
              onPress={() => setIsActivityPreviewExpanded((expanded) => !expanded)}
              style={[
                styles.previewAccordion,
                { backgroundColor: colors.background, borderColor: colors.outlineVariant },
              ]}>
              <ActivityPrivacyPreview
                allowActivityInteractions={settings.allowActivityInteractions}
                allowActivityReplayViewing={settings.allowActivityReplayViewing}
                allowActivityHeartRateViewing={settings.allowActivityHeartRateViewing}
                allowActivityElevationViewing={settings.allowActivityElevationViewing}
                allowActivityPaceViewing={settings.allowActivityPaceViewing}
                allowActivitySharing={settings.allowActivitySharing}
                hideHeading
                language={language}
              />
            </List.Accordion>
          ) : null}
          {title === 'profileSectionTitle' ? (
            <List.Accordion
              testID="profile-preview-accordion"
              title={text.profilePreviewTitle}
              titleStyle={{ color: colors.onSurface }}
              expanded={isProfilePreviewExpanded}
              onPress={() => setIsProfilePreviewExpanded((expanded) => !expanded)}
              style={[
                styles.previewAccordion,
                { backgroundColor: colors.background, borderColor: colors.outlineVariant },
              ]}>
              <ProfilePrivacyPreview
                profileSearchVisible={settings.profileSearchVisible}
                allowNewFollowers={settings.allowNewFollowers}
                hideActivityStatistics={settings.hideActivityStatistics}
                hideFollowingList={settings.hideFollowingList}
                hideProfilePhotos={settings.hideProfilePhotos}
                hideHeading
                language={language}
              />
            </List.Accordion>
          ) : null}
        </View>
      ))}
      <GroupNotificationSettings />
      {Platform.OS !== 'web' && (
        <View style={styles.group}>
          <Text variant="titleSmall" style={[styles.groupTitle, { color: colors.primary }]}>
            {text.deviceSectionTitle}
          </Text>
          <View style={styles.setting}>
            <Text variant="bodyMedium" style={styles.copy}>
              {text.saveCameraPhotosToGallery}
            </Text>
            <Switch
              testID="privacy-setting-saveCameraPhotosToGallery"
              accessibilityLabel={text.saveCameraPhotosToGallery}
              value={saveCameraPhotosToGallery}
              onValueChange={(value) => void changeSaveCameraPhotosToGallery(value)}
              disabled={isLoading || isRequestingGalleryPermission}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 20,
    marginTop: 12,
    padding: 16,
  },
  group: {
    gap: 14,
  },
  groupTitle: {
    fontWeight: '600',
  },
  previewAccordion: { borderRadius: 8, borderWidth: 1, marginTop: 4, overflow: 'hidden' },
  setting: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  copy: {
    flex: 1,
  },
});
