import { useState } from 'react';
import uuid from 'react-native-uuid';
import { ActivityIndicator, Icon } from 'react-native-paper';
import { useAppendActivityMediaMutation } from '@R/services/activity/activity';
import { finishLoading, startLoading } from '@R/slices/loading/loading';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { MAX_ACTIVITY_MEDIA } from '@Routes/save-activity-page/upload-photos-btn/ const';
import { uploadActivityMediaBatch } from '@Routes/save-activity-page/utils';
import MapMetaButton from '@S/card/map-meta-overlay/map-meta-button';
import { errorToast } from '@S/error-toast/error-toast';
import { deleteUploadedMedia, getAccessToGallery } from '@U/file-sending';
import { ADD_ACTIVITY_MEDIA_COPY } from './const';
import type { ActivityMediaItem } from '../types';
import type { MediaUploadItem } from '@U/file-sending';

export default function AddActivityMediaBtn({ activityId, media }: { activityId: string; media: ActivityMediaItem[] }) {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const { isLoading } = useAppSelector(({ loading }) => loading);
  const [appendActivityMedia] = useAppendActivityMediaMutation();
  const [isUploading, setIsUploading] = useState(false);
  const isDisabled = isLoading || isUploading || media.length >= MAX_ACTIVITY_MEDIA;
  const copy = ADD_ACTIVITY_MEDIA_COPY[language];

  const handlePress = async () => {
    if (isDisabled) return;
    setIsUploading(true);
    dispatch(startLoading());
    try {
      const remainingSlots = MAX_ACTIVITY_MEDIA - media.length;
      const result = await getAccessToGallery(['images'], {
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });
      const assets = result?.assets?.slice(0, remainingSlots) ?? [];
      if (!userId || !result || result.canceled || !assets.length) return;

      const uploadItems: MediaUploadItem[] = assets.map((asset) => ({
        fileSrc: asset.file ?? asset.uri,
        metadata: { fileName: asset.fileName, mimeType: asset.mimeType, mediaType: 'image' },
        mediaId: String(uuid.v4()),
      }));
      const uploadedMedia = (await uploadActivityMediaBatch(uploadItems)).filter(
        (item): item is NonNullable<typeof item> => Boolean(item),
      );
      if (!uploadedMedia.length) return;

      try {
        await appendActivityMedia({ id: activityId, media: uploadedMedia }).unwrap();
      } catch (error) {
        await deleteUploadedMedia(
          uploadedMedia.flatMap(({ url, thumbnail }) =>
            [url, thumbnail].filter((mediaUrl): mediaUrl is string => Boolean(mediaUrl)),
          ),
        );
        throw error;
      }
    } catch (error) {
      errorToast('', error);
    } finally {
      setIsUploading(false);
      dispatch(finishLoading());
    }
  };

  return (
    <MapMetaButton
      testID="activity-card-add-media-button"
      accessibilityLabel={copy.add}
      onPress={handlePress}
      disabled={isDisabled}>
      {isUploading ? (
        <ActivityIndicator size={24} color="#FFFFFF" />
      ) : (
        <Icon source="image-plus-outline" size={24} color="#FFFFFF" />
      )}
    </MapMetaButton>
  );
}
