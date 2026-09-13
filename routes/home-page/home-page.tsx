import { useEffect, useMemo } from 'react';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery } from '@R/services/activity/activity';
import { useGetAppConfigQuery } from '@R/services/authentication/authentication';
import { resetActivityDraft, resetFinishedActivity } from '@R/slices/activity/activity';
import { saveProfilePreview } from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import EmptyActivitiesList from '@Routes/home-page/empty-activities-list/empty-activities-list';
import FloatingBtn from '@Routes/home-page/floating-btn/floating-btn';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import ErrorComponent from '@S/error-component/error-component';
import InfiniteScrollList from '@S/infinite-scroll-list/infinite-scroll-list';
import { isAppVersionOutdated } from '@U/is-app-version-outdated';

export default function Feed() {
  const dispatch = useAppDispatch();
  const { push, replace } = useRouter();
  const { accessToken, userId } = useAppSelector(({ auth }) => auth);
  const { data, error, isLoading, isSuccess, refetch, fetchNextPage, isFetchingNextPage, isError } =
    useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery(
      {
        id: userId,
      },
      { skip: !userId },
    );
  const { data: appConfig } = useGetAppConfigQuery(undefined, { skip: !accessToken });
  const activities = useMemo(() => data?.pages.flatMap(({ activities }) => activities) ?? [], [data?.pages]);
  const currentUserProfile = data?.pages[0]?.currentUserProfile;

  useEffect(() => {
    if (currentUserProfile) dispatch(saveProfilePreview(currentUserProfile));
  }, [currentUserProfile, dispatch]);
  const isLastPage = !(data?.pages.at(-1)?.hasMore ?? false);

  useEffect(() => {
    const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
    if (appConfig?.appVersion && isAppVersionOutdated(currentVersion, appConfig.appVersion)) {
      replace(`/${ROUTES.updateApp}`);
    }
  }, [appConfig?.appVersion, replace]);

  return (
    <CrossPlatformLayout edges={[]} isLoading={isLoading} isError={isError}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="homeActivityIndicator" />
      ) : isSuccess ? (
        <>
          {activities && activities?.length > 0 && (
            <>
              <InfiniteScrollList
                dataToRender={activities}
                refetch={refetch}
                isLastPage={isLastPage}
                nextPageCallback={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
              <FloatingBtn
                onPressFn={() => {
                  dispatch(resetActivityDraft());
                  dispatch(resetFinishedActivity());
                  push({
                    pathname: `/${ROUTES.manualActivity}`,
                    params: {
                      cameraVisible: 'false',
                      manualDate: new Date().toISOString(),
                      manualDistance: '0',
                      manualHours: '0',
                      manualMinutes: '0',
                      manualSeconds: '0',
                      mode: 'manual',
                      title: '',
                      description: '',
                      sport: 'run',
                      emotion: 'normal',
                      isPublic: 'true',
                    },
                  });
                }}
              />
            </>
          )}
          {!activities?.length && <EmptyActivitiesList />}
        </>
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
    </CrossPlatformLayout>
  );
}
