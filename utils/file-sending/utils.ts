import { errorToast } from '@S/error-toast/error-toast';
import {
  compressMediaFile,
  createVideoThumbnail,
  uploadMediaFile,
  uploadMediaFiles,
  waitForMediaUploadReview,
} from '../file-sending';
import type {
  MediaSource,
  MediaSourceMetadata,
  MediaUploadControl,
  MediaUploadItem,
  MediaUploadOptions,
  UploadedMedia,
} from './file-sending-types';

const MEDIA_BATCH_CONCURRENCY = 3;

export async function uploadMediaWithThumbnail(
  fileSrc: MediaSource,
  uploadOptions: MediaUploadOptions,
  errorMessage: string,
  metadata: MediaSourceMetadata = {},
  control?: MediaUploadControl,
) {
  try {
    throwIfUploadAborted(control);
    const compressedFile = await compressMediaFile(fileSrc, metadata);
    if (!compressedFile) return null;

    reportProgress(control, 0.25);
    const uploadedFile = control
      ? await uploadMediaFile(compressedFile, uploadOptions, undefined, control)
      : await uploadMediaFile(compressedFile, uploadOptions);
    if (!uploadedFile) return null;
    const isActivityUpload = (uploadOptions.scope ?? 'activity') === 'activity';
    const reviewedFile = isActivityUpload ? uploadedFile : (await waitForMediaUploadReview([uploadedFile], control))[0];
    if (!reviewedFile?.url && !(isActivityUpload && reviewedFile?.assetId)) {
      errorToast(
        reviewedFile?.status === 'rejected'
          ? 'Модератор отклонил медиафайл'
          : 'Не удалось проверить медиафайл. Он пока недоступен',
      );
      return null;
    }
    reportProgress(control, 0.8);

    const uploadedMedia: UploadedMedia = {
      ...(reviewedFile.url || reviewedFile.previewUrl ? { url: reviewedFile.url ?? reviewedFile.previewUrl } : {}),
      thumbnail: null,
      ...(reviewedFile.assetId ? { assetId: reviewedFile.assetId } : {}),
      ...(reviewedFile.blurhash ? { blurhash: reviewedFile.blurhash } : {}),
      ...(reviewedFile.status ? { mediaReviewStatus: reviewedFile.status } : {}),
      ...(reviewedFile.contentType ? { contentType: reviewedFile.contentType } : {}),
    };

    if (!compressedFile.isVideo) {
      reportProgress(control, 1);
      return uploadedMedia;
    }

    const thumbnailSource = await createVideoThumbnail(compressedFile.file);
    if (!thumbnailSource) {
      reportProgress(control, 1);
      return uploadedMedia;
    }

    const compressedThumbnail = await compressMediaFile(thumbnailSource);
    if (!compressedThumbnail) {
      reportProgress(control, 1);
      return uploadedMedia;
    }

    const uploadedThumbnail = control
      ? await uploadMediaFile(compressedThumbnail, uploadOptions, undefined, control)
      : await uploadMediaFile(compressedThumbnail, uploadOptions);
    reportProgress(control, 1);
    const reviewedThumbnail = uploadedThumbnail
      ? isActivityUpload
        ? uploadedThumbnail
        : (await waitForMediaUploadReview([uploadedThumbnail], control))[0]
      : undefined;
    return {
      ...uploadedMedia,
      thumbnail: reviewedThumbnail?.url ?? null,
      ...(isActivityUpload && reviewedThumbnail?.assetId ? { thumbnailAssetId: reviewedThumbnail.assetId } : {}),
    };
  } catch (error) {
    if (!control?.signal?.aborted) errorToast(errorMessage, error);
    return null;
  }
}

export async function uploadMediaBatchWithThumbnails(
  mediaItems: readonly MediaUploadItem[],
  uploadOptions: MediaUploadOptions,
  errorMessage: string,
  control?: MediaUploadControl,
): Promise<(UploadedMedia | null)[]> {
  const emptyResult = () => mediaItems.map(() => null);
  if (!mediaItems.length) return [];

  try {
    throwIfUploadAborted(control);
    const compressed = await mapWithConcurrency(
      mediaItems,
      ({ fileSrc, metadata }) => compressMediaFile(fileSrc, metadata),
      MEDIA_BATCH_CONCURRENCY,
      (completed) => reportProgress(control, (completed / mediaItems.length) * 0.2),
    );
    throwIfUploadAborted(control);
    const compressedItems = compressed.flatMap((file, index) =>
      file ? [{ index, file, item: mediaItems[index] }] : [],
    );
    if (!compressedItems.length) return emptyResult();

    const uploadedFiles = control
      ? await uploadMediaFiles(
          compressedItems.map(({ file }) => file),
          uploadOptions,
          compressedItems.map(({ item }) => ({ mediaId: item.mediaId, role: 'media' })),
          undefined,
          withProgressRange(control, 0.2, 0.65),
        )
      : await uploadMediaFiles(
          compressedItems.map(({ file }) => file),
          uploadOptions,
          compressedItems.map(({ item }) => ({ mediaId: item.mediaId, role: 'media' })),
        );
    if (!uploadedFiles) return emptyResult();

    const isActivityUpload = (uploadOptions.scope ?? 'activity') === 'activity';
    const reviewedFiles = isActivityUpload ? uploadedFiles : await waitForMediaUploadReview(uploadedFiles, control);
    if (reviewedFiles.some(({ status }) => status === 'rejected')) {
      errorToast('Модератор отклонил часть медиафайлов');
    } else if (reviewedFiles.some(({ status }) => status === 'failed')) {
      errorToast('Не удалось проверить часть медиафайлов. Они не будут прикреплены');
    }

    const uploadedMedia: (UploadedMedia | null)[] = emptyResult();
    const uploadedByMediaId = new Map(reviewedFiles.map((uploadedFile) => [uploadedFile.mediaId, uploadedFile]));
    compressedItems.forEach(({ index, item }) => {
      const uploadedFile = uploadedByMediaId.get(item.mediaId);
      if (uploadedFile?.role === 'media' && (uploadedFile.url || (isActivityUpload && uploadedFile.assetId))) {
        uploadedMedia[index] = {
          ...(uploadedFile.url || uploadedFile.previewUrl ? { url: uploadedFile.url ?? uploadedFile.previewUrl } : {}),
          thumbnail: null,
          ...(uploadedFile.assetId ? { assetId: uploadedFile.assetId } : {}),
          ...(uploadedFile.blurhash ? { blurhash: uploadedFile.blurhash } : {}),
          ...(uploadedFile.status ? { mediaReviewStatus: uploadedFile.status } : {}),
          ...(uploadedFile.contentType ? { contentType: uploadedFile.contentType } : {}),
        };
      }
    });

    const videoItems = compressedItems.flatMap((item) =>
      item.file.isVideo && uploadedMedia[item.index] ? [item] : [],
    );
    const thumbnailItems = await mapWithConcurrency(
      videoItems,
      async ({ file, item }) => {
        throwIfUploadAborted(control);
        const uploadedFile = uploadedByMediaId.get(item.mediaId);
        if (!uploadedFile?.url && !(isActivityUpload && uploadedFile?.assetId)) return null;

        const thumbnailSource = await createVideoThumbnail(file.file);
        return thumbnailSource ? { mediaId: item.mediaId, file: await compressMediaFile(thumbnailSource) } : null;
      },
      MEDIA_BATCH_CONCURRENCY,
      (completed) => reportProgress(control, 0.65 + (completed / videoItems.length) * 0.15),
    );
    const compressedThumbnails = thumbnailItems.flatMap((item) => {
      if (!item?.file) return [];
      return [{ mediaId: item.mediaId, file: item.file }];
    });
    if (!compressedThumbnails.length) {
      reportProgress(control, 1);
      return uploadedMedia;
    }

    const uploadedThumbnails = control
      ? await uploadMediaFiles(
          compressedThumbnails.map(({ file }) => file),
          uploadOptions,
          compressedThumbnails.map(({ mediaId }) => ({ mediaId, role: 'thumbnail' })),
          undefined,
          withProgressRange(control, 0.8, 1),
        )
      : await uploadMediaFiles(
          compressedThumbnails.map(({ file }) => file),
          uploadOptions,
          compressedThumbnails.map(({ mediaId }) => ({ mediaId, role: 'thumbnail' })),
        );
    if (!uploadedThumbnails) return uploadedMedia;

    const uploadedThumbnailsByMediaId = new Map(
      uploadedThumbnails.map((uploadedThumbnail) => [uploadedThumbnail.mediaId, uploadedThumbnail]),
    );
    for (const { mediaId } of compressedThumbnails) {
      const uploadedThumbnail = uploadedThumbnailsByMediaId.get(mediaId);
      const reviewedThumbnail =
        uploadedThumbnail && !isActivityUpload
          ? (await waitForMediaUploadReview([uploadedThumbnail], control))[0]
          : uploadedThumbnail;
      const thumbnailUrl = reviewedThumbnail?.url ?? reviewedThumbnail?.previewUrl;
      const videoItem = videoItems.find(({ item }) => item.mediaId === mediaId);
      if (!videoItem) continue;
      const media = uploadedMedia[videoItem.index];
      if (media) {
        uploadedMedia[videoItem.index] = {
          ...media,
          ...(thumbnailUrl ? { thumbnail: thumbnailUrl } : {}),
          ...(reviewedThumbnail?.blurhash ? { blurhash: reviewedThumbnail.blurhash } : {}),
          ...(isActivityUpload && reviewedThumbnail?.assetId ? { thumbnailAssetId: reviewedThumbnail.assetId } : {}),
        };
      }
    }

    reportProgress(control, 1);
    return uploadedMedia;
  } catch (error) {
    if (!control?.signal?.aborted) errorToast(errorMessage, error);
    return emptyResult();
  }
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency = MEDIA_BATCH_CONCURRENCY,
  onItemComplete?: (completed: number) => void,
) {
  const results = Array.from({ length: items.length }) as R[];
  let nextIndex = 0;
  let completed = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await mapper(items[index], index);
      completed += 1;
      onItemComplete?.(completed);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

function withProgressRange(control: MediaUploadControl | undefined, start: number, end: number) {
  if (!control) return undefined;
  return {
    signal: control.signal,
    onProgress: (progress: number) => reportProgress(control, start + (end - start) * progress),
  } satisfies MediaUploadControl;
}

function reportProgress(control: MediaUploadControl | undefined, progress: number) {
  if (!control?.signal?.aborted) control?.onProgress?.(Math.max(0, Math.min(progress, 1)));
}

function throwIfUploadAborted(control: MediaUploadControl | undefined) {
  if (control?.signal?.aborted) throw new Error('Загрузка медиафайлов отменена');
}
