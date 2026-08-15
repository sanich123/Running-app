import PagerView from 'react-native-pager-view';
import uuid from 'react-native-uuid';
import { View, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useGetActivityByActivityIdQuery, useGetAllActivityPhotosByUserIdQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import VideoViewer from '@Routes/photo-viewer/video-viewer/video-viewer';
import { CustomImage } from '@S/custom-image/custom-image';
import type { ActivityPhotoResponse } from '@R/runich-api/types';

const VIDEO_EXTENSIONS = ['mp4', 'avi', 'm4v'];

function getPhotoUrl(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return '';
  }

  // Expo Router can return a dynamic path segment either already decoded or
  // still percent-encoded on web. Decode only the latter case so encoded
  // characters inside a signed storage URL are not decoded twice.
  if (/^(?:https?|data|blob):\/\//i.test(rawValue) || /^data:/i.test(rawValue)) {
    return rawValue;
  }

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

function isVideoUrl(url: string) {
  const pathname = url.split('?')[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((extension) => pathname.endsWith(`.${extension}`));
}

export default function PhotoViewer() {
  const { photoUrl, indexOfPhoto, userId, take } = useLocalSearchParams();
  const webPhotoUrl = getPhotoUrl(photoUrl);
  const { colors } = useTheme();
  const { userId: ownerId } = useAppSelector(({ auth }) => auth);
  const { data: activity } = useGetActivityByActivityIdQuery(`${photoUrl}`, {
    skip: !photoUrl || !uuid.validate(`${photoUrl}`),
  });
  const { data } = useGetAllActivityPhotosByUserIdQuery(
    {
      userId: userId ? `${userId}` : ownerId,
      take: Number(take),
    },
    { skip: !take },
  );
  const itemsToRender = uuid.validate(`${photoUrl}`) ? (activity?.photoVideoUrls ?? []) : (data?.photos ?? []);

  const isMapUrlExist = activity?.mapPhotoUrl ? +`${indexOfPhoto}` - 1 : +`${indexOfPhoto}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {Platform.OS === 'web' ? (
        <>
          {isVideoUrl(webPhotoUrl) ? (
            <VideoViewer url={webPhotoUrl} />
          ) : (
            <CustomImage
              source={{ uri: webPhotoUrl }}
              style={[styles.webImage, { backgroundColor: colors.background }]}
              contentFit="contain"
            />
          )}
        </>
      ) : (
        <>
          {itemsToRender.length > 0 && (
            <PagerView
              style={styles.viewPager}
              initialPage={uuid.validate(`${photoUrl}`) ? isMapUrlExist : +`${photoUrl}`}
              orientation="vertical">
              {itemsToRender.map(({ url, blurhash }: ActivityPhotoResponse, index: number) => (
                <View key={index}>
                  {['mp4', 'avi', 'm4v'].includes(url) ? (
                    <VideoViewer url={url} />
                  ) : (
                    <CustomImage
                      source={{ uri: url }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      placeholder={blurhash}
                    />
                  )}
                </View>
              ))}
            </PagerView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  webImage: {
    alignSelf: 'stretch',
    flex: 1,
    width: '100%',
  },
  viewPager: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
