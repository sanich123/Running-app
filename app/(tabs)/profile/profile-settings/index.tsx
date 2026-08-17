import { lazy, Suspense, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { savePhotoUrl } from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { getInitialProfileSettingsParams } from '@Routes/profile/profile-settings/profile-settings-params';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';
import type { ProfileSettingsSearchParams } from '@Routes/profile/profile-settings/profile-settings-params';

const LazyAvatarIconEditable = lazy(() => import('@Routes/profile/profile-settings/avatar-editable/editable'));
const LazyGenderBtns = lazy(() => import('@Routes/profile/profile-settings/gender-btns/gender-btns'));
const LazyInputBio = lazy(() => import('@Routes/profile/profile-settings/input-bio/input-bio'));
const LazyInputsNameSurname = lazy(
  () => import('@Routes/profile/profile-settings/inputs-name-surname/inputs-name-surname'),
);
const LazyInputsWeightCity = lazy(
  () => import('@Routes/profile/profile-settings/inputs-weight-city/inputs-weight-city'),
);

export default function ProfileSettings() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { profileSettingsInitialized } = useLocalSearchParams() as Partial<ProfileSettingsSearchParams>;
  const { setParams } = useRouter();
  const {
    data: profile,
    isLoading: isProfileLoading,
    isSuccess,
  } = useGetUserProfileByUserIdQuery(userId, {
    skip: !userId,
  });
  const [isDisabled, setIsDisabled] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!isSuccess || !profile || profileSettingsInitialized === 'true') {
      return;
    }

    dispatch(savePhotoUrl(profile?.profilePhoto ?? ''));
    setParams({
      profileSettingsInitialized: 'true',
      ...getInitialProfileSettingsParams(profile),
    });
  }, [dispatch, isSuccess, profile, profileSettingsInitialized, setParams]);

  const isFormDisabled = isDisabled || isProfileLoading;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor: colors.background,
          width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
      <Suspense fallback={<FullPageActivityLoader />}>
        <LazyAvatarIconEditable setIsDisabled={setIsDisabled} isDisabled={isFormDisabled} />
        <LazyInputsNameSurname isDisabled={isFormDisabled} />
        <LazyInputsWeightCity isDisabled={isFormDisabled} />
        <LazyInputBio isDisabled={isFormDisabled} />
        <LazyGenderBtns isDisabled={isFormDisabled} />
      </Suspense>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
});
