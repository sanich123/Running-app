import { Platform, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import ProfilePrivacySettings from '../profile-privacy-settings/profile-privacy-settings';
import { getProfilePrivacySettingsProps } from '../utils';

export default function ProfilePrivacySettingsPage() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { userId } = useAppSelector(({ auth }) => auth);
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserProfileByUserIdQuery(userId ?? '', {
    skip: !userId,
  });
  const privacySettings = profile && userId ? getProfilePrivacySettingsProps(userId, profile) : null;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor: colors.background,
          width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="profile-privacy-settings-loading" />
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : privacySettings ? (
        <ProfilePrivacySettings key={Object.values(privacySettings).join(':')} {...privacySettings} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 12,
  },
});
