import { useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { v4 as generateUuid } from 'react-native-uuid';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import { uploadFeedbackAttachments } from '@U/feedback-sending';
import { deleteUploadedMedia, getAccessToGallery } from '@U/file-sending';
import { MAX_FEEDBACK_ATTACHMENTS } from './const';
import type { PendingAttachmentPreview } from './types';
import type { FeedbackAttachment } from '@R/services/feedback/feedback';
import type { MediaUploadItem } from '@U/file-sending';
import type * as ImagePicker from 'expo-image-picker';

interface UseFeedbackAttachmentsOptions {
  feedbackId: string;
  copy: { openGalleryError: string; attachmentUploadError: string };
  setFeedbackError: Dispatch<SetStateAction<string | null>>;
}

export default function useFeedbackAttachments({ feedbackId, copy, setFeedbackError }: UseFeedbackAttachmentsOptions) {
  const [attachments, setAttachments] = useState<FeedbackAttachment[]>([]);
  const [pendingAttachmentPreviews, setPendingAttachmentPreviews] = useState<PendingAttachmentPreview[]>([]);
  const [deletingAttachments, setDeletingAttachments] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const removedPendingMediaIds = useRef(new Set<string>());

  async function choosePhoto() {
    if (attachments.length >= MAX_FEEDBACK_ATTACHMENTS) return;

    let result: ImagePicker.ImagePickerResult | undefined;
    try {
      result = await getAccessToGallery(['images', 'videos'], {
        allowsMultipleSelection: true,
        selectionLimit: MAX_FEEDBACK_ATTACHMENTS - attachments.length,
      });
    } catch (error) {
      errorToast(copy.openGalleryError, error);
      setFeedbackError(`${copy.openGalleryError}: ${getErrorMessageFromError(error)}`);
      return;
    }

    if (!result || result.canceled || !result.assets?.length) return;

    const selectedPhotos = result.assets.slice(0, MAX_FEEDBACK_ATTACHMENTS - attachments.length);
    const mediaItems: MediaUploadItem[] = selectedPhotos.map((photo) => ({
      fileSrc: photo.file ?? photo.uri,
      metadata: {
        fileName: photo.fileName,
        mimeType: photo.mimeType,
        mediaType: photo.type === 'video' ? 'video' : 'image',
      },
      mediaId: String(generateUuid()),
    }));
    removedPendingMediaIds.current.clear();
    setFeedbackError(null);
    setPendingAttachmentPreviews(
      selectedPhotos.map(({ uri, type }, index) => ({
        mediaId: mediaItems[index].mediaId,
        uri,
        isVideo: type === 'video',
      })),
    );
    setIsUploadingPhoto(true);
    try {
      const uploadedAttachments = await uploadFeedbackAttachments(mediaItems, feedbackId);
      const successfulUploadCount = uploadedAttachments.filter(Boolean).length;
      const successfulAttachments = uploadedAttachments.flatMap((attachment, index) =>
        attachment?.url && !removedPendingMediaIds.current.has(mediaItems[index].mediaId)
          ? [{ ...attachment, url: attachment.url }]
          : [],
      );
      if (successfulAttachments.length) {
        setAttachments((currentAttachments) => [...currentAttachments, ...successfulAttachments]);
      }
      if (successfulUploadCount !== selectedPhotos.length) {
        setFeedbackError(copy.attachmentUploadError);
      }
    } catch (error) {
      errorToast(copy.attachmentUploadError, error);
      setFeedbackError(`${copy.attachmentUploadError}: ${getErrorMessageFromError(error)}`);
    } finally {
      setPendingAttachmentPreviews([]);
      removedPendingMediaIds.current.clear();
      setIsUploadingPhoto(false);
    }
  }

  async function removeAttachment(attachment: FeedbackAttachment) {
    if (deletingAttachments.includes(attachment.url)) return;

    setDeletingAttachments((current) => [...current, attachment.url]);
    setAttachments((current) => current.filter(({ url }) => url !== attachment.url));
    try {
      await deleteUploadedMedia(
        [attachment.url, attachment.thumbnail].filter((url): url is string => Boolean(url)),
        [],
        feedbackId,
      );
    } finally {
      setDeletingAttachments((current) => current.filter((url) => url !== attachment.url));
    }
  }

  function removePendingAttachment(mediaId: string) {
    removedPendingMediaIds.current.add(mediaId);
    setPendingAttachmentPreviews((current) => current.filter((preview) => preview.mediaId !== mediaId));
  }

  function clearAttachments() {
    setAttachments([]);
    setPendingAttachmentPreviews([]);
    setDeletingAttachments([]);
    removedPendingMediaIds.current.clear();
  }

  return {
    attachments,
    pendingAttachmentPreviews,
    deletingAttachments,
    isUploadingPhoto,
    choosePhoto,
    removeAttachment,
    removePendingAttachment,
    clearAttachments,
  };
}
