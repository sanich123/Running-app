import { errorToast } from '@S/error-toast/error-toast';
import { compressMediaFile, createVideoThumbnail, uploadMediaFile, uploadMediaFiles } from '../file-sending';
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
    reportProgress(control, 0.8);

    if (!compressedFile.isVideo) {
      reportProgress(control, 1);
      return { url: uploadedFile.url, thumbnail: null };
    }

    const thumbnailSource = await createVideoThumbnail(
      typeof compressedFile.file === 'string' ? compressedFile.file : uploadedFile.url,
    );
    if (!thumbnailSource) {
      reportProgress(control, 1);
      return { url: uploadedFile.url, thumbnail: null };
    }

    const compressedThumbnail = await compressMediaFile(thumbnailSource);
    if (!compressedThumbnail) {
      reportProgress(control, 1);
      return { url: uploadedFile.url, thumbnail: null };
    }

    const uploadedThumbnail = control
      ? await uploadMediaFile(compressedThumbnail, uploadOptions, undefined, control)
      : await uploadMediaFile(compressedThumbnail, uploadOptions);
    reportProgress(control, 1);
    return { url: uploadedFile.url, thumbnail: uploadedThumbnail?.url ?? null };
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

    const uploadedMedia: (UploadedMedia | null)[] = emptyResult();
    const uploadedByMediaId = new Map(uploadedFiles.map((uploadedFile) => [uploadedFile.mediaId, uploadedFile]));
    compressedItems.forEach(({ index, item }) => {
      const uploadedFile = uploadedByMediaId.get(item.mediaId);
      if (uploadedFile?.role === 'media') uploadedMedia[index] = { url: uploadedFile.url, thumbnail: null };
    });

    const videoItems = compressedItems.flatMap((item) =>
      item.file.isVideo && uploadedMedia[item.index] ? [item] : [],
    );
    const thumbnailItems = await mapWithConcurrency(
      videoItems,
      async ({ file, item }) => {
        throwIfUploadAborted(control);
        const uploadedFile = uploadedByMediaId.get(item.mediaId);
        if (!uploadedFile) return null;

        const thumbnailSource = await createVideoThumbnail(
          typeof file.file === 'string' ? file.file : uploadedFile.url,
        );
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
    compressedThumbnails.forEach(({ mediaId }) => {
      const thumbnailUrl = uploadedThumbnailsByMediaId.get(mediaId)?.url;
      const videoItem = videoItems.find(({ item }) => item.mediaId === mediaId);
      if (!thumbnailUrl || !videoItem) return;
      const media = uploadedMedia[videoItem.index];
      if (media) uploadedMedia[videoItem.index] = { ...media, thumbnail: thumbnailUrl };
    });

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
